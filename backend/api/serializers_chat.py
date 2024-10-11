
from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp']

class SendMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['receiver', 'content']