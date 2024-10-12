from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Message
from .serializers_chat import MessageSerializer
from .serializers_chat import SendMessageSerializer




class MessageListCreateView(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(receiver=user)


class SendMessageView(generics.CreateAPIView):
    serializer_class = SendMessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class MessageHistoryView(APIView):
    def get(self, request, room_name):
        messages = Message.objects.filter(room_name=room_name)  # Adjust filtering as needed
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
