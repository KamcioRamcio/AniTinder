from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models_friends import FriendList, FriendRequest
from .models_chat import Chat
from .models_user import Profile


@receiver(post_save, sender=User)
def create_friend_list(sender, instance, created, **kwargs):
    if created:
        FriendList.objects.create(user=instance)


@receiver(post_save, sender=FriendRequest)
def create_chat_room(sender, instance, created, **kwargs):
    if instance.is_accepted:
        user1 = instance.sender
        user2 = instance.receiver
        participant_ids = sorted([str(user1.id), str(user2.id)])
        room_name = '_'.join(participant_ids)

        if not Chat.objects.filter(room_name=room_name).exists():
            chat = Chat.objects.create(room_name=room_name)
            chat.participants.add(user1, user2)
            chat.save()