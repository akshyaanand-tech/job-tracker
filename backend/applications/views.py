from django.db.models import Count, Q
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Application
from .serializers import ApplicationSerializer, RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'Account created successfully.'},
            status=status.HTTP_201_CREATED,
        )


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        queryset = Application.objects.filter(owner=self.request.user)

        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(company__icontains=search) | Q(role__icontains=search)
            )

        status_param = self.request.query_params.get('status', '').strip()
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = Application.objects.filter(owner=request.user)
        status_counts = queryset.values('status').annotate(count=Count('id'))
        counts = {item['status']: item['count'] for item in status_counts}

        return Response({
            'total': queryset.count(),
            'applied': counts.get(Application.STATUS_APPLIED, 0),
            'interviewing': counts.get(Application.STATUS_INTERVIEWING, 0),
            'rejected': counts.get(Application.STATUS_REJECTED, 0),
        })
