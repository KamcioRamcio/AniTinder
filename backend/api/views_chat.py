from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Chat, ChatMessage
from rest_framework import generics
from .serializers_chat import ChatMessageSerializer
from django.db import models

class ChatView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, room_name):
        try:
            chat = Chat.objects.get(models.Q(room_name_1=room_name) | models.Q(room_name_2=room_name))
            messages = ChatMessage.objects.filter(chat=chat)
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
        except Chat.DoesNotExist:
            return Response({"error": "Chat not found"}, status=404)

class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_name):
        current_user = request.user
        other_user_id = request.GET.get('other_user_id')

        if not other_user_id:
            return JsonResponse({"error": "Other user ID not provided"}, status=400)

        try:
            chat = Chat.objects.get(models.Q(room_name_1=room_name) | models.Q(room_name_2=room_name), participants__id__in=[current_user.id, other_user_id])
            messages = ChatMessage.objects.filter(chat=chat)
            messages_data = [{
                'sender': message.sender.username,
                'message': message.content,
                'timestamp': message.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            } for message in messages]
            return JsonResponse(messages_data, safe=False)
        except Chat.DoesNotExist:
            return JsonResponse({"error": "Chat not found or user not a participant"}, status=404)

class ChatMessageListView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        room_name = self.kwargs['room_name']
        try:
            chat = Chat.objects.get(models.Q(room_name_1=room_name) | models.Q(room_name_2=room_name))
            return ChatMessage.objects.filter(chat=chat).order_by('timestamp')
        except Chat.DoesNotExist:
            return ChatMessage.objects.none()