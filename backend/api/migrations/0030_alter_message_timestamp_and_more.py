# Generated by Django 5.1.1 on 2024-10-12 08:33

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_message'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['sender', 'receiver'], name='api_message_sender__54a403_idx'),
        ),
    ]
