# Generated by Django 5.1.1 on 2024-10-02 16:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_useranimelist_username'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='useranimelist',
            name='username',
        ),
    ]
