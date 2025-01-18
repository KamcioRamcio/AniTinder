from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=150)
    bio = models.TextField(default='No bio')
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True,
                                      default='profile_images/pfp1_CMiXTdg.jpg')
    anime_list_public = models.BooleanField(default=True)

    def __str__(self):
        return self.user


class UserAnimeList(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    mal_id = models.IntegerField(blank=True, null=True)
    watched = models.BooleanField(default=False)
    add_time = models.DateTimeField(auto_now_add=True)
    plan_to_watch = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class TempDeletedAnime(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    image_url = models.URLField(blank=True, null=True)
    mal_id = models.IntegerField(blank=True, null=True)
    time_deleted = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    def __str__(self):
        return self.title