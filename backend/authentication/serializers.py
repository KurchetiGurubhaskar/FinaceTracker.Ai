from rest_framework import serializers
from users.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('notify_weekly_summary', 'notify_unusual_activity', 'notify_marketing')

class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        if hasattr(instance, 'profile'):
            profile = instance.profile
            profile.notify_weekly_summary = profile_data.get('notify_weekly_summary', profile.notify_weekly_summary)
            profile.notify_unusual_activity = profile_data.get('notify_unusual_activity', profile.notify_unusual_activity)
            profile.notify_marketing = profile_data.get('notify_marketing', profile.notify_marketing)
            profile.save()

        return instance
