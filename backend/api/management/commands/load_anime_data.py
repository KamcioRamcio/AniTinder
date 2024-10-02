# backend/api/management/commands/load_anime_data.py
import json
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from api.models import Anime, AnimeListGenres# Import the Genre model


class Command(BaseCommand):
    help = 'Load anime data from a JSON file into the database'

    def handle(self, *args, **kwargs):
        # Use BASE_DIR to form the absolute path to the JSON file
        file_path = os.path.join(settings.BASE_DIR, 'api', 'data', 'anime_data.json')

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        with open(file_path, 'r') as file:
            data = json.load(file)

        for key, value in data['title'].items():

            title = data['title'].get(key, 'Unknown Title')
            score = data['score'].get(key, 0.0)
            episodes = data['episodes'].get(key, 0)
            year = data['year'].get(key, 0)
            image_url = data['image_url'].get(key, '')
            synopsis = data['synopsis'].get(key, '')
            trailer_url = data['trailer_url'].get(key, '')
            genres_raw = data['genres'].get(key, '')
            mal_id = data['mal_id'].get(key, 0)

            if not year:
                self.stdout.write(self.style.ERROR(f"Skipping entry due to missing year for title: {title}"))
                continue

            # Create the anime object
            anime_obj = Anime(
                title=title,
                score=score,
                episodes=episodes,
                year=year,
                image_url=image_url,
                synopsis=synopsis,
                trailer_url=trailer_url,
                mal_id=mal_id
            )
            anime_obj.save()

            # Process and assign multiple genres
            genres_list = [genre.strip() for genre in genres_raw.split(',')]  # Split the genres and clean them

            for genre_name in genres_list:
                # Use get_or_create to avoid duplicates and ensure the genre exists
                genre_obj, created = AnimeListGenres.objects.get_or_create(name=genre_name)
                anime_obj.genres.add(genre_obj)  # Add the genre to the anime object

            anime_obj.save()  # Save the anime object after assigning genres

        self.stdout.write(self.style.SUCCESS('Successfully loaded anime data into the database'))
