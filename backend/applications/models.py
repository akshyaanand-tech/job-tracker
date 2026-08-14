from django.contrib.auth.models import User
from django.db import models


class Application(models.Model):
    STATUS_APPLIED = 'Applied'
    STATUS_INTERVIEWING = 'Interviewing'
    STATUS_REJECTED = 'Rejected'

    STATUS_CHOICES = [
        (STATUS_APPLIED, 'Applied'),
        (STATUS_INTERVIEWING, 'Interviewing'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_APPLIED)
    date_applied = models.DateField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_applied', '-created_at']

    def __str__(self):
        return f'{self.company} — {self.role}'
