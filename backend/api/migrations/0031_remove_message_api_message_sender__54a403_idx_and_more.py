# Generated by Django 5.1.1 on 2024-10-12 10:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_alter_message_timestamp_and_more'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='message',
            name='api_message_sender__54a403_idx',
        ),
        migrations.AlterField(
            model_name='message',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
