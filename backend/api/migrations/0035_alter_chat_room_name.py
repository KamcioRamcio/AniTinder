# Generated by Django 5.1.1 on 2024-10-13 09:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0034_alter_chatmessage_options_chat_room_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='room_name',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
