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



class AnimeQuotes(models.Model):
    anime = models.CharField(max_length=255)
    quote = models.TextField()
    character = models.CharField(max_length=255)

    def __str__(self):
        return self.quote

