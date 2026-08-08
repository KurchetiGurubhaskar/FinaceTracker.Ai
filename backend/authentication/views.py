from rest_framework import generics
from rest_framework.permissions import AllowAny
from users.models import User
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

import os
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            import requests as http_requests
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            response = http_requests.get(user_info_url, headers={'Authorization': f'Bearer {token}'})
            
            if response.status_code != 200:
                return Response({'error': f'Invalid access token from Google: {response.text}'}, status=status.HTTP_400_BAD_REQUEST)
                
            idinfo = response.json()
            email = idinfo.get('email')
            name = idinfo.get('name')
            
            if not email:
                return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user exists
            user, created = User.objects.get_or_create(email=email, defaults={
                'username': email.split('@')[0],
                'first_name': name.split(' ')[0] if name else '',
                'last_name': ' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else ''
            })
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'is_new_user': created
            })
            
        except ValueError as e:
            return Response({'error': f'Token verification failed: {str(e)} | client_id was: {client_id}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Unknown error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.permissions import IsAuthenticated
from .serializers import UserDetailSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user
