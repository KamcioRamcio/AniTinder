# backend/backend/application.py
import os

import django
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.core.wsgi import get_wsgi_application

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Setup Django
django.setup()

# Import websocket_urlpatterns after Django setup
from api.routing import websocket_urlpatterns  # Ensure this is the correct path

# Create the ASGI application
asgi_application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Serve HTTP requests
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})

# Create the WSGI application
wsgi_application = get_wsgi_application()

# Define a single application attribute for ASGI
application = asgi_application
