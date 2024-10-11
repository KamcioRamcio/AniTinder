from django.contrib.auth.models import User
from rest_framework import serializers
from .models_follow import Follow

class FollowUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class FollowListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    following = FollowUserSerializer(many=True, read_only=True)

    class Meta:
        model = Follow
        fields = ['username', 'user_id', 'following']


class FollowersListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    followers = FollowUserSerializer(many=True, read_only=True)

    class Meta:
        model = Follow
        fields = ['username', 'followers', 'user_id']
