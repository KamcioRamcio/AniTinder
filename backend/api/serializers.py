from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Genre, Anime, UserAnimeList, TempDeletedAnime, AnimeQuotes, Profile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'email': {'write_only': True, 'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # Create the profile with the username field
        Profile.objects.create(user=user, username=user.username)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'username','bio', 'profile_image']



class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'author', 'name']
        extra_kwargs = {'author': {'read_only': True}}

class AnimeSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True)
    class Meta:
        model = Anime
        fields = ['id', 'title', 'genres', 'score', 'episodes', 'year', 'image_url', 'synopsis', 'trailer_url', 'mal_id']

class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimeQuotes
        fields = ['id', 'anime', 'character', 'quote']

class UserAnimeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = UserAnimeList
        fields = ['id', 'author', 'username', 'title', 'image_url', 'mal_id', 'watched', 'plan_to_watch', 'add_time']
        extra_kwargs = {'author': {'read_only': True}}



class TempDeletedAnimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempDeletedAnime
        fields = ['id', 'author', 'title', 'mal_id']
        extra_kwargs = {'author': {'read_only': True}}

class AllUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'username', 'profile_image']