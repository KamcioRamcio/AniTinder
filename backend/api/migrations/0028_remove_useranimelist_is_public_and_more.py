# Generated by Django 5.1.1 on 2024-10-11 13:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_alter_friendlist_friends_alter_friendlist_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='useranimelist',
            name='is_public',
        ),
        migrations.AddField(
            model_name='profile',
            name='anime_list_public',
            field=models.BooleanField(default=True),
        ),
    ]
