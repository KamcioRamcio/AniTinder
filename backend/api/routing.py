# backend/api/routing.py

from django.urls import re_path, path
from .consumers import *

websocket_urlpatterns = [
    path('ws/chat/<int:sender_id>_<int:receiver_id>/', ChatConsumer.as_asgi()),
]
