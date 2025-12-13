"""
Gunicorn configuration for production deployment
"""
import multiprocessing
import os

# Server socket
bind = "0.0.0.0:5001"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1  # Recommended formula
worker_class = "sync"  # Use 'gevent' or 'eventlet' for async if needed
worker_connections = 1000
max_requests = 1000  # Restart workers after this many requests (prevents memory leaks)
max_requests_jitter = 50  # Add randomness to max_requests
timeout = 30  # Worker timeout in seconds
keepalive = 2  # Keep-alive connections

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "hotelrbs_backend"

# Server mechanics
daemon = False  # Don't daemonize (useful for Docker/systemd)
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (uncomment and configure for HTTPS)
# keyfile = "/path/to/key.pem"
# certfile = "/path/to/cert.pem"

# Security
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

def on_starting(server):
    """Called just before the master process is initialized."""
    print("🚀 Starting Gunicorn server...")

def on_reload(server):
    """Called to recycle workers during a reload via SIGHUP."""
    print("🔄 Reloading workers...")

def when_ready(server):
    """Called just after the server is started."""
    print(f"✅ Gunicorn server ready on {bind}")
    print(f"👷 Workers: {workers}")
    print(f"⚙️  Worker class: {worker_class}")

def worker_int(worker):
    """Called when a worker receives the SIGINT or SIGQUIT signal."""
    print(f"⚠️  Worker received INT or QUIT signal: {worker.pid}")

def worker_abort(worker):
    """Called when a worker times out."""
    print(f"❌ Worker timeout: {worker.pid}")

