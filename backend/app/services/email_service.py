import logging
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


import socket

class IPv4SMTP(smtplib.SMTP):
    """SMTP client that forces IPv4 address resolution to prevent Network Unreachable errors on containers."""
    def _get_socket(self, host, port, timeout):
        res = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        err = None
        for af, socktype, proto, canonname, sa in res:
            try:
                s = socket.socket(af, socktype, proto)
                if timeout is not None:
                    s.settimeout(timeout)
                s.connect(sa)
                return s
            except socket.error as e:
                err = e
                if s:
                    s.close()
        if err:
            raise err
        raise socket.error("No IPv4 address found for SMTP host")


class IPv4SMTP_SSL(smtplib.SMTP_SSL):
    """SMTP_SSL client that forces IPv4 address resolution to prevent Network Unreachable errors on containers."""
    def _get_socket(self, host, port, timeout):
        res = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        err = None
        for af, socktype, proto, canonname, sa in res:
            try:
                s = socket.socket(af, socktype, proto)
                if timeout is not None:
                    s.settimeout(timeout)
                s.connect(sa)
                return s
            except socket.error as e:
                err = e
                if s:
                    s.close()
        if err:
            raise err
        raise socket.error("No IPv4 address found for SMTP host")


def send_password_reset_otp_email(to_email: str, otp: str) -> bool:
    """
    Sends a 6-digit OTP to the specified email address via SMTP.
    Never logs the plaintext OTP.
    Returns True if sent successfully, False if SMTP is unconfigured or failed.
    """
    if not settings.smtp_host:
        logger.warning(
            "SMTP_HOST is not configured. OTP email delivery skipped for recipient: %s. [DEV MODE OTP CODE: %s]",
            to_email,
            otp,
        )
        print(f"\n========================================================", flush=True)
        print(f"[DEV MODE] OTP Code for {to_email}: {otp}", flush=True)
        print(f"========================================================\n", flush=True)
        return False

    current_year = datetime.now().year

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #FAF9F6;
      color: #14120F;
      margin: 0;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }}
    .container {{
      max-width: 500px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px 30px;
      border: 1px solid #E8E1D3;
      text-align: center;
      box-shadow: 0 4px 12px rgba(20, 18, 15, 0.04);
    }}
    .logo {{
      font-family: Georgia, serif;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 3px;
      color: #14120F;
      margin-bottom: 30px;
      text-transform: uppercase;
    }}
    .title {{
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #14120F;
    }}
    .message {{
      font-size: 14px;
      color: #8A8578;
      line-height: 1.6;
      margin-bottom: 24px;
    }}
    .otp-box {{
      background-color: #FAF9F6;
      border: 1px solid #E8E1D3;
      padding: 18px 24px;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 10px;
      color: #6E2430;
      margin: 20px 0 28px 0;
      display: inline-block;
    }}
    .footer {{
      font-size: 12px;
      color: #8A8578;
      margin-top: 32px;
      border-top: 1px solid #E8E1D3;
      padding-top: 20px;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">ELAANJI</div>
    <div class="title">Password Reset Code</div>
    <p class="message">Your password reset verification code is:</p>
    <div class="otp-box">{otp}</div>
    <p class="message">This code expires in 5 minutes.</p>
    <p class="message">If you did not request a password reset, you can safely ignore this email.</p>
    <div class="footer">
      © {current_year} ELAANJI. All rights reserved.
    </div>
  </div>
</body>
</html>"""

    text_body = f"""ELAANJI — Password Reset Code

Your password reset verification code is:

{otp}

This code expires in 5 minutes.

If you did not request a password reset, you can safely ignore this email.
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Password Reset Code"
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if settings.smtp_port == 465:
            with IPv4SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                if settings.smtp_username and settings.smtp_password:
                    server.login(settings.smtp_username, settings.smtp_password)
                server.send_message(msg)
        else:
            with IPv4SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                if settings.smtp_username and settings.smtp_password:
                    server.login(settings.smtp_username, settings.smtp_password)
                server.send_message(msg)
        logger.info("Password reset OTP email sent successfully to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send OTP email via SMTP to %s: %s", to_email, str(e))
        return False

