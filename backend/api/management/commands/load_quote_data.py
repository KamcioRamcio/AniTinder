import json
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from api.models import AnimeQuotes

class Command(BaseCommand):
    help = 'Load anime quotes data from a JSON file into the database'

    def handle(self, *args, **kwargs):
        # Use BASE_DIR to form the absolute path to the JSON file
        file_path = os.path.join(settings.BASE_DIR, 'api', 'data', 'quotes.json')

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        with open(file_path, 'r') as file:
            data = json.load(file)

        for item in data:
            anime= item.get('anime', 'Unknown Anime')
            quote = item.get('quote', '')
            character = item.get('character', '')

            # Create the anime object
            anime_obj = AnimeQuotes(
                anime=anime,
                quote=quote,
                character=character
            )
            anime_obj.save()
        self.stdout.write(self.style.SUCCESS('Successfully loaded anime quotes data'))