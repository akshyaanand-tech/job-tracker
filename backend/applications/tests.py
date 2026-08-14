from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Application


class RegistrationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')

    def test_register_creates_user(self):
        response = self.client.post(self.register_url, {
            'username': 'newuser',
            'password': 'securepass123',
            'password_confirm': 'securepass123',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_duplicate_username(self):
        User.objects.create_user(username='existing', password='securepass123')
        response = self.client.post(self.register_url, {
            'username': 'existing',
            'password': 'securepass123',
            'password_confirm': 'securepass123',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        response = self.client.post(self.register_url, {
            'username': 'newuser2',
            'password': 'securepass123',
            'password_confirm': 'differentpass',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        response = self.client.post(self.register_url, {
            'username': 'newuser3',
            'password': '123',
            'password_confirm': '123',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.token_url = reverse('token_obtain_pair')
        self.refresh_url = reverse('token_refresh')

    def test_login_returns_tokens(self):
        response = self.client.post(self.token_url, {
            'username': 'testuser',
            'password': 'testpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_invalid_login_returns_401(self):
        response = self.client.post(self.token_url, {
            'username': 'testuser',
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_returns_new_access(self):
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post(self.refresh_url, {'refresh': str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_unauthenticated_access_denied(self):
        response = self.client.get('/api/applications/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ApplicationValidationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='validuser', password='pass12345')
        self.client.force_authenticate(user=self.user)

    def test_create_requires_company(self):
        response = self.client.post('/api/applications/', {
            'company': '   ',
            'role': 'Engineer',
            'status': Application.STATUS_APPLIED,
            'date_applied': '2026-03-01',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_requires_role(self):
        response = self.client.post('/api/applications/', {
            'company': 'Acme',
            'role': '',
            'status': Application.STATUS_APPLIED,
            'date_applied': '2026-03-01',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_rejects_invalid_status(self):
        response = self.client.post('/api/applications/', {
            'company': 'Acme',
            'role': 'Engineer',
            'status': 'InvalidStatus',
            'date_applied': '2026-03-01',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_rejects_client_owner(self):
        other = User.objects.create_user(username='otheruser', password='pass12345')
        response = self.client.post('/api/applications/', {
            'company': 'Acme',
            'role': 'Engineer',
            'status': Application.STATUS_APPLIED,
            'date_applied': '2026-03-01',
            'owner': other.id,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        app = Application.objects.get(id=response.data['id'])
        self.assertEqual(app.owner, self.user)


class OwnershipIsolationTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='pass12345')
        self.user2 = User.objects.create_user(username='user2', password='pass12345')

        self.app1 = Application.objects.create(
            company='Acme Corp',
            role='Engineer',
            status=Application.STATUS_APPLIED,
            date_applied='2026-01-15',
            owner=self.user1,
        )
        self.app2 = Application.objects.create(
            company='Beta Inc',
            role='Designer',
            status=Application.STATUS_INTERVIEWING,
            date_applied='2026-02-01',
            owner=self.user2,
        )

        self.client.force_authenticate(user=self.user1)

    def test_user_only_sees_own_applications(self):
        response = self.client.get('/api/applications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['company'], 'Acme Corp')

    def test_user_cannot_retrieve_other_users_application(self):
        response = self.client.get(f'/api/applications/{self.app2.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_other_users_application(self):
        response = self.client.patch(f'/api/applications/{self.app2.id}/', {
            'status': Application.STATUS_REJECTED,
        })
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.app2.refresh_from_db()
        self.assertEqual(self.app2.status, Application.STATUS_INTERVIEWING)

    def test_user_cannot_delete_other_users_application(self):
        response = self.client.delete(f'/api/applications/{self.app2.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Application.objects.filter(id=self.app2.id).exists())

    def test_owner_assigned_on_create(self):
        response = self.client.post('/api/applications/', {
            'company': 'New Co',
            'role': 'Developer',
            'status': Application.STATUS_APPLIED,
            'date_applied': '2026-03-01',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        app = Application.objects.get(id=response.data['id'])
        self.assertEqual(app.owner, self.user1)

    def test_stats_only_reflect_own_data(self):
        response = self.client.get('/api/applications/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 1)
        self.assertEqual(response.data['applied'], 1)
        self.assertEqual(response.data['interviewing'], 0)

    def test_search_and_filter(self):
        Application.objects.create(
            company='Google',
            role='SWE',
            status=Application.STATUS_REJECTED,
            date_applied='2026-01-20',
            owner=self.user1,
        )
        response = self.client.get('/api/applications/?search=Google')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['company'], 'Google')

        response = self.client.get('/api/applications/?status=Applied')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['company'], 'Acme Corp')
