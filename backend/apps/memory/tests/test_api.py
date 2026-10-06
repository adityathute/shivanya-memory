from unittest.mock import patch
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory,force_authenticate
from apps.memory.api.views import NoteViewSet
class MemoryApiTests(SimpleTestCase):
    @patch("apps.memory.api.views.Note.objects")
    def test_notes_queryset_is_user_scoped(self,objects):
        request=APIRequestFactory().get("/api/v1/memory/notes/")
        request.user=type("User",(),{"pk":"user-1"})()
        view=NoteViewSet()
        view.request=request
        objects.filter.return_value="scoped"
        self.assertEqual(view.get_queryset(),"scoped")
        objects.filter.assert_called_once_with(user=request.user)