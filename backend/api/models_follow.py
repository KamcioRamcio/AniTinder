from django.contrib.auth.models import User
from django.db import models

class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_users')
    following = models.ManyToManyField(User, related_name='followers', blank=True)


    def __str__(self):
        return f"{self.user.username} follows {self.following.count()} users"

    def add_following(self, account):
        if not self.is_following(account):
            self.following.add(account)
            self.save()

    def remove_following(self, account):
        if self.is_following(account):
            self.following.remove(account)
            self.save()

    def is_following(self, account):
        return self.following.filter(id=account.id).exists()
