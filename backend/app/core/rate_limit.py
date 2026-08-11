"""
Rate limiting for endpoints that are cheap to abuse (login brute-forcing,
repeated order placement). Keyed by client IP via slowapi's default
get_remote_address — good enough for a single-instance deployment; a
multi-instance deployment behind a load balancer should key off a header
the LB sets instead.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
