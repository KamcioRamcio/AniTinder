from django.contrib import admin

from .models_friends import FriendRequest, FriendList
from .models_user import Profile

# RegisterPage your models here.

class FriendListAdmin(admin.ModelAdmin):
    search_fields = ['user__username']
    list_display = ['user']
    list_filter = ['user']
    readonly_fields = ['user']

    class Meta:
        model = FriendList

admin.site.register(FriendList, FriendListAdmin)


class FriendRequestAdmin(admin.ModelAdmin):
    search_fields = ['sender__username', 'receiver__username']
    list_display = ['sender', 'receiver', 'is_active']
    list_filter = ['sender', 'receiver', 'is_active']
    readonly_fields = ['sender', 'receiver']

    class Meta:
        model = FriendRequest

admin.site.register(FriendRequest, FriendRequestAdmin)

admin.site.register(Profile)