from django.contrib.auth.models import User
from rest_framework import serializers
from .models_anime import Genre, Anime, AnimeQuotes, TempDeletedAnime
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'author', 'name']
        extra_kwargs = {'author': {'read_only': True}}


class AnimeSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True)

    class Meta:
        model = Anime
        fields = ['id', 'title', 'genres', 'score', 'episodes', 'year', 'image_url', 'synopsis', 'trailer_url',
                  'mal_id']


class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimeQuotes
        fields = ['id', 'anime', 'character', 'quote']

class TempDeletedAnimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempDeletedAnime
        fields = ['id', 'author', 'title', 'mal_id']
        extra_kwargs = {'author': {'read_only': True}}
