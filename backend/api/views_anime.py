import json
import os

from django.db.models.functions import Lower, Substr
from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models_anime import Genre, Anime, TempDeletedAnime, AnimeQuotes
from .serializers_anime import GenreSerializer, AnimeSerializer, TempDeletedAnimeSerializer, QuoteSerializer


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


class AnimeAllView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = AnimeSerializer

    def get_queryset(self):
        return Anime.objects.annotate(
            first_letter=Lower(Substr('title', 1, 1))
        ).order_by('first_letter')


class TempDeletedAnimeView(generics.ListCreateAPIView):
    serializer_class = TempDeletedAnimeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        return TempDeletedAnime.objects.filter(author=user)



    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
