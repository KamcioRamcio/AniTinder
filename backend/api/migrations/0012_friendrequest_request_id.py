# Generated by Django 5.1.1 on 2024-10-07 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_alter_profile_profile_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='friendrequest',
            name='request_id',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]
