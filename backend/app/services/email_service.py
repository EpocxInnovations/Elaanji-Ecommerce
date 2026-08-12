import logging
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


import socket

import ssl

class IPv4SMTP(smtplib.SMTP):
    """SMTP client that forces IPv4 address resolution to prevent Network Unreachable errors on containers."""
    def _get_socket(self, host, port, timeout):
        res = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        err = None
        for af, socktype, proto, canonname, sa in res:
            s = None
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
    """SMTP_SSL client that forces IPv4 address resolution and SSL context wrapping for Gmail."""
    def _get_socket(self, host, port, timeout):
        res = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        err = None
        for af, socktype, proto, canonname, sa in res:
            raw_sock = None
            try:
                raw_sock = socket.socket(af, socktype, proto)
                if timeout is not None:
                    raw_sock.settimeout(timeout)
                raw_sock.connect(sa)
                ctx = getattr(self, "context", None) or ssl.create_default_context()
                return ctx.wrap_socket(raw_sock, server_hostname=host)
            except socket.error as e:
                err = e
                if raw_sock:
                    raw_sock.close()
        if err:
            raise err
        raise socket.error("No IPv4 address found for SMTP host")


import json
import os
import urllib.request


def send_via_resend_api(to_email: str, otp: str, html_body: str, text_body: str) -> bool:
    """Sends email via Resend HTTPS REST API (Port 443). Bypasses outbound SMTP port blocks."""
    resend_key = os.environ.get("RESEND_API_KEY", "")
    if not resend_key:
        return False
    try:
        url = "https://api.resend.com/emails"
        sender_address = (
            "onboarding@resend.dev"
            if "resend.dev" in settings.smtp_from_email or not settings.smtp_from_email or "gmail.com" in settings.smtp_from_email
            else settings.smtp_from_email
        )
        payload = {
            "from": f"{settings.smtp_from_name} <{sender_address}>",
            "to": [to_email],
            "subject": "Your Password Reset Code",
            "html": html_body,
            "text": text_body,
        }
        headers = {
            "Authorization": f"Bearer {resend_key}",
            "Content-Type": "application/json",
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                logger.info("Password reset OTP email sent via Resend HTTPS API to %s", to_email)
                return True
    except Exception as e:
        logger.error("Failed to send email via Resend HTTPS API to %s: %s", to_email, str(e))
    return False


def send_password_reset_otp_email(to_email: str, otp: str) -> bool:
    """
    Handles 6-digit OTP code for password reset.
    Always logs the generated random 6-digit code to the server console.
    """
    print(f"\n========================================================", flush=True)
    print(f"[CONSOLE OTP CODE] Random 6-digit OTP for {to_email}: {otp}", flush=True)
    print(f"========================================================\n", flush=True)
    logger.warning("========================================================")
    logger.warning("[CONSOLE OTP CODE] Random 6-digit OTP for %s: %s", to_email, otp)
    logger.warning("========================================================")

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

    # 1. Try Resend HTTPS REST API if key is present
    if os.environ.get("RESEND_API_KEY"):
        if send_via_resend_api(to_email, otp, html_body, text_body):
            return True

    # 2. Check if SMTP is configured
    if not settings.smtp_host:
        logger.warning(
            "SMTP_HOST is not configured. OTP email delivery skipped for recipient: %s. [RENDER LOG OTP CODE: %s]",
            to_email,
            otp,
        )
        print(f"\n========================================================", flush=True)
        print(f"[RENDER LOG OTP CODE] OTP for {to_email}: {otp}", flush=True)
        print(f"========================================================\n", flush=True)
        return False

    # 3. Try standard SMTP with SSL Context
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Password Reset Code"
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    ssl_ctx = ssl.create_default_context()

    try:
        # Default Gmail to Port 465 SSL for instant delivery
        target_port = 465 if "gmail" in settings.smtp_host.lower() or settings.smtp_port == 465 else settings.smtp_port

        if target_port == 465:
            with IPv4SMTP_SSL(settings.smtp_host, 465, context=ssl_ctx, timeout=15) as server:
                if settings.smtp_username and settings.smtp_password:
                    server.login(settings.smtp_username, settings.smtp_password)
                server.send_message(msg)
        else:
            try:
                with IPv4SMTP(settings.smtp_host, target_port, timeout=10) as server:
                    server.ehlo()
                    server.starttls(context=ssl_ctx)
                    server.ehlo()
                    if settings.smtp_username and settings.smtp_password:
                        server.login(settings.smtp_username, settings.smtp_password)
                    server.send_message(msg)
            except (socket.timeout, TimeoutError, socket.error, smtplib.SMTPException) as conn_err:
                logger.info("SMTP Port %s failed (%s). Retrying via SSL Port 465...", settings.smtp_port, conn_err)
                with IPv4SMTP_SSL(settings.smtp_host, 465, context=ssl_ctx, timeout=15) as server:
                    if settings.smtp_username and settings.smtp_password:
                        server.login(settings.smtp_username, settings.smtp_password)
                    server.send_message(msg)
        logger.info("Password reset OTP email sent successfully to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send OTP email via SMTP to %s: %s", to_email, str(e))
        logger.warning("========================================================")
        logger.warning("[RENDER LOG OTP CODE FOR %s]: %s", to_email, otp)
        logger.warning("========================================================")
        print(f"\n[RENDER LOG OTP CODE] OTP for {to_email}: {otp}\n", flush=True)
        return False




