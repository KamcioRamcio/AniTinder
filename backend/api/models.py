from django.contrib.auth.models import User
from django.db import models

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name

class AnimeListGenres(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Anime(models.Model):
    title = models.CharField(max_length=255)
    score = models.FloatField(blank=True, null=True)
    episodes = models.IntegerField(blank=True, null=True)
    genres = models.ManyToManyField(AnimeListGenres, related_name='anime')
    year = models.IntegerField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    synopsis = models.TextField(blank=True, null=True)
    trailer_url = models.URLField(blank=True, null=True)
    mal_id = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.title

class UserAnimeList(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    mal_id = models.IntegerField(blank=True, null=True)
    watched = models.BooleanField(default=False)
    add_time = models.DateTimeField(auto_now_add=True)
    plan_to_watch = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class TempDeletedAnime(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    mal_id = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.title

class AnimeQuotes(models.Model):
    anime = models.CharField(max_length=255)
    quote = models.TextField()
    character = models.CharField(max_length=255)

    def __str__(self):
        return self.quote

class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user')
    friends = models.ManyToManyField(User, related_name='friends', blank=True)

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
        remover = self  # user who wants to remove a friend
        remover.remove_friend(removee)
        removee.remove_friend(remover)
        return True

    def is_mutual_friend(self, friend):
        if friend in self.friends.all():
            return True
        return False

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

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=150)
    bio = models.TextField(default='No bio')
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    def __str__(self):
        return self.user