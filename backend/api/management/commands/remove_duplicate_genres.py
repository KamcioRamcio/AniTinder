from django.core.management.base import BaseCommand
from api.models import Genre
from django.db import models

class Command(BaseCommand):
    help = 'Remove duplicate genres from the database'

    def handle(self, *args, **kwargs):
        # Find all genres with duplicate names
        duplicates = (Genre.objects.values('name')
                      .annotate(name_count=models.Count('id'))
                      .filter(name_count__gt=1))

        for genre in duplicates:
            # Get all duplicate genres with this name
            duplicate_genres = Genre.objects.filter(name=genre['name'])
            primary_genre = duplicate_genres.first()  # Keep the first one
            duplicates_to_delete = duplicate_genres[1:]  # Delete all others

            for duplicate in duplicates_to_delete:
                # If any Anime is related to the duplicate, transfer them to the primary genre
                for anime in duplicate.anime_set.all():
                    anime.genres.remove(duplicate)
                    anime.genres.add(primary_genre)

                # Delete the duplicate genre
                duplicate.delete()

        self.stdout.write(self.style.SUCCESS('Successfully removed duplicate genres'))
