from django.contrib import admin

from .models_chat import Chat, ChatMessage
from .models_friends import FriendRequest, FriendList
from .models_user import Profile

# Register your models here.

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
class ChatAdmin(admin.ModelAdmin):
    list_display = ['id']  # You can modify this to show relevant fields if needed
    search_fields = ['participants__username']  # If you want to search by participant usernames

admin.site.register(Chat, ChatAdmin)
admin.site.register(ChatMessage)
