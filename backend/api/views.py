import json
import os
#eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4MzE0MTAwLCJpYXQiOjE3MjgzMTIzMDAsImp0aSI6ImY5ZjI0YmQ2OTNhODQ1ZGFhNDc1NjYyMWIyYTcyYTkxIiwidXNlcl9pZCI6MX0.b7NCYAnvPoMuGuxeMoNfprajbOa6cgI38cBg-fkIYsc
from django.contrib.auth.models import User
from django.db.models.functions import Lower, Substr
from django.http import JsonResponse
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError, NotFound


from .models import Genre, Anime, UserAnimeList, TempDeletedAnime, AnimeQuotes, Profile, \
    FriendRequest, FriendList, Follow

from .serializers import UserSerializer, GenreSerializer, AnimeSerializer, UserAnimeSerializer, \
    TempDeletedAnimeSerializer, QuoteSerializer, ProfileSerializer, AllUsersSerializer, FriendRequestSerializer, \
    FriendRequestAcceptDeclineSerializer, FriendListSerializer, UnfriendSerializer, FollowListSerializer,\
    FollowersListSerializer


# Create your views here.
class UserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(self.request.data['password'])
        user.save()

class UserProfileView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        try:
            return Profile.objects.get(user__id=self.kwargs['id'])
        except Profile.DoesNotExist:
            raise NotFound("Profile not found")

class UserProfileUpdateView(generics.UpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        try:
            return Profile.objects.get(user__id=self.kwargs['id'])
        except Profile.DoesNotExist:
            raise NotFound("Profile not found")

    def perform_update(self, serializer):
        serializer.save()

class UserAnimeByUsernameView(generics.ListAPIView):
    serializer_class = UserAnimeSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        id = self.kwargs.get('id')
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            raise NotFound("User not found")

        return UserAnimeList.objects.filter(author=user)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class GenreList(generics.ListCreateAPIView):
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Genre.objects.filter(author=user)

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        serializer.save(author=self.request.user)

class GenreDelete(generics.DestroyAPIView):
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Genre.objects.filter(author=user)

class AnimeView(generics.ListCreateAPIView):
    queryset = Anime.objects.all()
    serializer_class = AnimeSerializer
    permission_classes = [AllowAny]

def read_json_file_view(request):
    file_path = os.path.join(os.path.dirname(__file__), 'data', 'anime_data.json')
    with open(file_path, 'r') as file:
        json_data = json.load(file)

    return JsonResponse(json_data)

class AnimeQuotesView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = QuoteSerializer
    queryset = AnimeQuotes.objects.all()

class UserAnimeView(generics.ListCreateAPIView):
    serializer_class = UserAnimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return UserAnimeList.objects.filter(author=user)

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        serializer.save(author=self.request.user)


class RecentAnimeView(generics.ListCreateAPIView):
    serializer_class = UserAnimeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        id = self.kwargs.get('id')
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            raise NotFound("User not found")
        return UserAnimeList.objects.filter(author=user).order_by('-add_time')[:5]


class UserAnimeDeleteView(generics.DestroyAPIView):
    serializer_class = UserAnimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return UserAnimeList.objects.filter(author=user)

class UserAnimeUpdateView(generics.UpdateAPIView):
    serializer_class = UserAnimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return UserAnimeList.objects.filter(author=user)

    def perform_update(self, serializer):
        serializer.save(author=self.request.user)

    def put(self, request, mal_id):
        try:
            user_anime = UserAnimeList.objects.get(mal_id=mal_id, author=request.user)
            serializer = self.get_serializer(user_anime, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Anime status updated successfully'}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserAnimeList.DoesNotExist:
            return Response({'error': 'Anime not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AnimeAllView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = AnimeSerializer

    def get_queryset(self):
        return Anime.objects.annotate(
            first_letter=Lower(Substr('title', 1, 1))
        ).order_by('first_letter')

class TempDeletedAnimeView(generics.ListCreateAPIView):
    serializer_class = TempDeletedAnimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TempDeletedAnime.objects.filter(author=user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class AllUsersView (generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = AllUsersSerializer
    permission_classes = [AllowAny]

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