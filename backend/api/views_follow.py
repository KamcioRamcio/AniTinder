import json
import os


from django.contrib.auth.models import User
from django.db.models.functions import Lower, Substr
from django.http import JsonResponse
from rest_framework import generics
from rest_framework import status
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models_follow import Follow
from .serializers_follow import FollowListSerializer, FollowersListSerializer


class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user  # Authenticated user making the request
        user_to_follow_id = self.kwargs.get('user_id')  # Extract user_id from the URL path

        if not user_to_follow_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_follow = User.objects.get(id=user_to_follow_id)  # Get the user to follow
        except User.DoesNotExist:
            return Response({'error': f'User with ID {user_to_follow_id} not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get or create the Follow instance for the current user
        follow_instance, created = Follow.objects.get_or_create(user=user)  # Ensure user is passed

        # Check if the user is already following the target user
        if follow_instance.is_following(user_to_follow):
            return Response({'message': 'You are already following this user.'}, status=status.HTTP_400_BAD_REQUEST)

        # Add the user to the following list
        follow_instance.add_following(user_to_follow)
        return Response({'message': 'User followed successfully'}, status=status.HTTP_200_OK)


class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        user_to_unfollow_id = self.kwargs.get('user_id')

        if not user_to_unfollow_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_unfollow = User.objects.get(id=user_to_unfollow_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        follow_instance = Follow.objects.get(user=user)

        if not follow_instance.is_following(user_to_unfollow):
            return Response({'message': 'Not following this user'}, status=status.HTTP_400_BAD_REQUEST)

        follow_instance.remove_following(user_to_unfollow)
        return Response({'message': 'Unfollowed successfully'}, status=status.HTTP_200_OK)


class FollowingListByIdView(generics.ListCreateAPIView):
    serializer_class = FollowListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        id = self.kwargs.get('id')
        try:
            user = User.objects.get(id=id)
            return Follow.objects.filter(user=user)
        except User.DoesNotExist:
            raise NotFound("User not found")
        except Follow.DoesNotExist:
            raise NotFound("Follow list not found")


class FollowersListByIdView(generics.ListCreateAPIView):
    serializer_class = FollowersListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        id = self.kwargs.get('id')
        try:
            user = User.objects.get(id=id)
            return Follow.objects.filter(following=user)
        except User.DoesNotExist:
            raise NotFound("User not found")
        except Follow.DoesNotExist:
            raise NotFound("Follow list not found")
