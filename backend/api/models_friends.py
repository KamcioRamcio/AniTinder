from django.contrib.auth.models import User
from django.db import models

class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='friend_list')
    friends = models.ManyToManyField(User, related_name='friend_lists', blank=True)

    def __str__(self):
        return self.user.username

    def add_friend(self, account):
        if not account in self.friends.all():
            self.friends.add(account)
            self.save()

    def remove_friend(self, account):
        if account in self.friends.all():
            self.friends.remove(account)
            self.save()

    def unfriend(self, removee):
        # Remove friend from both users' friend lists
        self.remove_friend(removee)
        friend_friend_list = FriendList.objects.get(user=removee)
        friend_friend_list.remove_friend(self.user)
        return True

    def is_mutual_friend(self, friend):
        return friend in self.friends.all()


class FriendRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
    is_active = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sender.username

    def accept(self):
        sender_friend_list = FriendList.objects.get(user=self.sender)
        receiver_friend_list = FriendList.objects.get(user=self.receiver)
        if sender_friend_list and receiver_friend_list:
            sender_friend_list.add_friend(self.receiver)
            receiver_friend_list.add_friend(self.sender)
            self.is_active = False
            self.save()
            return True
        return False

    def decline(self):
        self.is_active = False
        self.save()
        return True

    def cancel(self):
        self.is_active = False
        self.save()
        return True


