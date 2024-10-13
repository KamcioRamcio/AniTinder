# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Chat, ChatMessage
from django.contrib.auth.models import User
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.sender_id = self.scope['url_route']['kwargs'].get('sender_id')
        self.receiver_id = self.scope['url_route']['kwargs'].get('receiver_id')

        if not self.sender_id or not self.receiver_id:
            await self.close()
            return

        participant_ids = sorted([self.sender_id, self.receiver_id])
        self.room_name_1 = f'{participant_ids[0]}_{participant_ids[1]}'
        self.room_name_2 = f'{participant_ids[1]}_{participant_ids[0]}'
        self.room_group_name = f'chat_{self.room_name_1}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data['sender']
        receiver_id = data['receiver']
        message_content = data['content']

        chat = await self.get_chat(sender_id, receiver_id)
        sender = await self.get_user(sender_id)
        receiver = await self.get_user(receiver_id)

        chat_message = await self.create_chat_message(chat, sender, message_content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': chat_message.content,
                'sender': sender.id,
                'receiver': receiver.id,
                'timestamp': chat_message.timestamp.isoformat()
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'receiver': event['receiver'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def get_chat(self, sender_id, receiver_id):
        participant_ids = sorted([sender_id, receiver_id])
        room_name_1 = '_'.join(map(str, participant_ids))
        room_name_2 = '_'.join(map(str, participant_ids[::-1]))

        chat = Chat.objects.filter(room_name_1=room_name_1).first() or Chat.objects.filter(room_name_2=room_name_2).first()
        if not chat:
            chat = Chat.objects.create()
            chat.participants.set([sender_id, receiver_id])
            chat.save()
        return chat

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def create_chat_message(self, chat, sender, message):
        return ChatMessage.objects.create(chat=chat, sender=sender, content=message)