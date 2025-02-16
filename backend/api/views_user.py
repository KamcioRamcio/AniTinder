from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models_user import Profile, UserAnimeList, TempDeletedAnime
from .serializers_user import UserSerializer, ProfileSerializer, UserAnimeSerializer, AllUsersSerializer, \
    TempDeletedAnimeSerializer


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


class UserAnimeByIdView(generics.ListAPIView):
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
    permission_classes = [AllowAny]

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


class TempDeletedAnimeView(generics.ListCreateAPIView):
    serializer_class = TempDeletedAnimeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        return TempDeletedAnime.objects.filter(author=user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class AllUsersView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = AllUsersSerializer
    permission_classes = [AllowAny]


class DeleteTempDeletedAnimeView(generics.DestroyAPIView):
    serializer_class = TempDeletedAnimeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        return TempDeletedAnime.objects.filter(author=user)


class DeleteAllTmpDeletedAnimeView(generics.ListAPIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk, *args, **kwargs):
        user = request.user
        temp_deleted_anime = TempDeletedAnime.objects.filter(author=user)

        if temp_deleted_anime.exists():
            temp_deleted_anime.delete()
            return Response({"detail": "All temporarily deleted anime were successfully deleted."},
                            status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"detail": "No temporarily deleted anime found."}, status=status.HTTP_404_NOT_FOUND)