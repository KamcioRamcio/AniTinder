# models_chat.py
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Chat(models.Model):
    participants = models.ManyToManyField(User, related_name='chats')
    room_name_1 = models.CharField(max_length=255, unique=True, blank=True)
    room_name_2 = models.CharField(max_length=255, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.room_name_1 or not self.room_name_2:
            participant_ids = sorted([str(participant.id) for participant in self.participants.all()])
            self.room_name_1 = '_'.join(participant_ids)
            self.room_name_2 = '_'.join(participant_ids[::-1])
            if Chat.objects.filter(room_name_1=self.room_name_1).exists() or Chat.objects.filter(room_name_2=self.room_name_2).exists():
                raise ValidationError(f"Chat with room_name '{self.room_name_1}' or '{self.room_name_2}' already exists.")
        super().save(*args, **kwargs)

class ChatMessage(models.Model):
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)