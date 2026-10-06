from django.test import SimpleTestCase
from unittest.mock import patch
from rest_framework.test import APIRequestFactory
from apps.memory.api.views import MemoryPinResetRequestView
class MemoryPinResetTests(SimpleTestCase):
    @patch("django.contrib.auth.hashers.check_password")
    def test_reset_requires_account_password(self,check):
        request=APIRequestFactory().post("/pin/reset/request/",{"current_password":"x"},format="json")
        request.user=type("User",(),{"password":"hash","pk":"1"})()
        check.return_value=False
        response=MemoryPinResetRequestView.as_view()(request)
        self.assertEqual(response.status_code,400)
