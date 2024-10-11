from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models_friends import FriendList
from .models_user import Profile


@receiver(post_save, sender=User)
def create_friend_list(sender, instance, created, **kwargs):
    if created:
        FriendList.objects.create(user=instance)

