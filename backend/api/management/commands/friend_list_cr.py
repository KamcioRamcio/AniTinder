
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models_friends import FriendList

class Command(BaseCommand):
    help = 'Create FriendList for all existing users'

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        for user in users:
            if not FriendList.objects.filter(user=user).exists():
                FriendList.objects.create(user=user)
                self.stdout.write(self.style.SUCCESS(f'Created FriendList for user {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'FriendList already exists for user {user.username}'))