import json
import os

# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4MzE0MTAwLCJpYXQiOjE3MjgzMTIzMDAsImp0aSI6ImY5ZjI0YmQ2OTNhODQ1ZGFhNDc1NjYyMWIyYTcyYTkxIiwidXNlcl9pZCI6MX0.b7NCYAnvPoMuGuxeMoNfprajbOa6cgI38cBg-fkIYsc
from django.contrib.auth.models import User
from django.db.models.functions import Lower, Substr
from django.http import JsonResponse
from rest_framework import generics
from rest_framework import status
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models_friends import FriendList, FriendRequest
from .serializers_friends import FriendRequestSerializer, FriendRequestAcceptDeclineSerializer, FriendListSerializer
# Create your views here.



class FriendRequestView(generics.ListCreateAPIView):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return FriendRequest.objects.filter(receiver=user)

    def perform_create(self, serializer):
        friend_id = self.kwargs.get('friendId')
        user = self.request.user

        if user.id == friend_id:
            raise ValidationError("You cannot send a friend request to yourself.")

        try:
            friend = User.objects.get(id=friend_id)
        except User.DoesNotExist:
            raise NotFound("User not found")

        if FriendRequest.objects.filter(sender=user, receiver=friend).exists():
            raise ValidationError("Friend request already sent.")

        serializer.save(sender=user, receiver=friend)


class AcceptFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = FriendRequestAcceptDeclineSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            success = serializer.accept()
            if success:
                return Response({'message': 'Friend request accepted'}, status=status.HTTP_200_OK)
            return Response({'error': 'Unable to accept friend request'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeclineFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = FriendRequestAcceptDeclineSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            success = serializer.decline()
            if success:
                return Response({'message': 'Friend request declined'}, status=status.HTTP_200_OK)
            return Response({'error': 'Unable to decline friend request'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UnfriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        user_id = self.kwargs.get('user_id')
        try:
            friend = User.objects.get(id=user_id)
            friend_list = FriendList.objects.get(user_id=user)
            friend_list.remove_friend(friend)
            friend_friend_list = FriendList.objects.get(user=friend)
            friend_friend_list.remove_friend(user)

            return Response({'message': 'Unfriended successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except FriendList.DoesNotExist:
            return Response({'error': 'Friend list not found'}, status=status.HTTP_404_NOT_FOUND)


class FriendListView(generics.ListCreateAPIView):
    serializer_class = FriendListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        try:
            return FriendList.objects.filter(user_id=user)
        except FriendList.DoesNotExist:
            raise NotFound("Friend list not found")


class FriendListByIdView(generics.ListCreateAPIView):
    serializer_class = FriendListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        id = self.kwargs.get('id')
        try:
            user = User.objects.get(id=id)
            return FriendList.objects.filter(user_id=user)
        except User.DoesNotExist:
            raise NotFound("User not found")
        except FriendList.DoesNotExist:
            raise NotFound("Friend list not found")


