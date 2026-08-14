from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Application


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, trim_whitespace=True)
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    def validate_username(self, value):
        username = value.strip()
        if not username:
            raise serializers.ValidationError('Username is required.')
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return username

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'company', 'role', 'status', 'date_applied', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_company(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError('Company is required.')
        return cleaned

    def validate_role(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError('Role is required.')
        return cleaned

    def validate_status(self, value):
        valid_statuses = {choice[0] for choice in Application.STATUS_CHOICES}
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f'Invalid status. Must be one of: {", ".join(sorted(valid_statuses))}.'
            )
        return value
