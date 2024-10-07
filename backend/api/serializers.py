from rest_framework import serializers
from django.contrib.auth.models import User
from urllib3 import request

from .models import Genre, Anime, UserAnimeList, TempDeletedAnime, AnimeQuotes, Profile, FriendRequest


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
        fields = ['id', 'username', 'profile_image', 'user_id']

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'is_active']
        extra_kwargs = {'sender': {'read_only': True}, 'receiver': {'read_only': True}}

from rest_framework import serializers
from .models import FriendRequest

class FriendRequestAcceptSerializer(serializers.Serializer):
    request_id = serializers.IntegerField()

    def validate(self, data):
        request_id = data.get('request_id')
        user = self.context['request'].user
        try:
            # Ensure the request exists and is valid
            friend_request = FriendRequest.objects.get(id=request_id, receiver=user, is_active=True)
        except FriendRequest.DoesNotExist:
            raise serializers.ValidationError("Friend request not found or already accepted.")
        return data

    def accept(self):
        request_id = self.validated_data.get('request_id')
        user = self.context['request'].user
        try:
            friend_request = FriendRequest.objects.get(id=request_id, receiver=user, is_active=True)
            return friend_request.accept()
        except FriendRequest.DoesNotExist:
            return False


