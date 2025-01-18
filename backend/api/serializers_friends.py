from django.contrib.auth.models import User
from rest_framework import serializers
from .models_friends import FriendList, FriendRequest

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'is_active']
        extra_kwargs = {'sender': {'read_only': True}, 'receiver': {'read_only': True}}

class FriendRequestAcceptDeclineSerializer(serializers.Serializer):
    request_id = serializers.IntegerField()

    def validate(self, data):
        request_id = data.get('request_id')
        user = self.context['request'].user
        try:
            friend_request = FriendRequest.objects.get(id=request_id, receiver=user, is_active=True)
        except FriendRequest.DoesNotExist:
            raise serializers.ValidationError("Friend request not found or already accepted.")
        return data

    def accept(self):
        request_id = self.validated_data.get('request_id')
        user = self.context['request'].user
        try:
            friend_request = FriendRequest.objects.get(id=request_id, receiver=user, is_active=True)
            return friend_request.accept()
        except FriendRequest.DoesNotExist:
            return False

    def decline(self):
        request_id = self.validated_data.get('request_id')
        user = self.context['request'].user
        try:
            friend_request = FriendRequest.objects.get(id=request_id, receiver=user, is_active=True)
            return friend_request.decline()
        except FriendRequest.DoesNotExist:
            return False


class UnfriendSerializer(serializers.Serializer):
    friend_id = serializers.IntegerField()

    def validate(self, data):
        friend_id = data.get('friend_id')
        user = self.context['request'].user
        try:
            friend = User.objects.get(id=friend_id)
            if friend == user:
                raise serializers.ValidationError("You cannot unfriend yourself.")
        except User.DoesNotExist:
            raise serializers.ValidationError("Friend not found.")
        return data

    def unfriend(self):
        friend_id = self.validated_data.get('friend_id')
        user = self.context['request'].user
        try:
            friend = User.objects.get(id=friend_id)
            user_friend_list = FriendList.objects.get(user=user)
            friend_friend_list = FriendList.objects.get(user=friend)

            # Ensure both users are in each other's friend lists before unfriending
            if user_friend_list.is_mutual_friend(friend) and friend_friend_list.is_mutual_friend(user):
                user_friend_list.unfriend(friend)
                return True
            else:
                raise serializers.ValidationError("You are not friends.")
        except (User.DoesNotExist, FriendList.DoesNotExist):
            raise serializers.ValidationError("Friend or friend list not found.")


class FriendUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class FriendListSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    friends = FriendUserSerializer(many=True, read_only=True)

    class Meta:
        model = FriendList
        fields = ['user', 'friends']


