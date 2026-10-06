from unittest.mock import patch
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory
from rest_framework.exceptions import AuthenticationFailed
from apps.common.authentication.jwt import MemoryJWTAuthentication
class MemoryAuthenticationTests(SimpleTestCase):
    def test_missing_header_returns_none(self):
        request=APIRequestFactory().get("/api/v1/memory/notes/")
        self.assertIsNone(MemoryJWTAuthentication().authenticate(request))
    @patch.object(MemoryJWTAuthentication,"get_validated_token")
    def test_missing_session_claim_is_rejected(self,mock_token):
        request=APIRequestFactory().get("/api/v1/memory/notes/")
        request.META["HTTP_AUTHORIZATION"]="Bearer token"
        mock_token.return_value={"user_id":"user"}
        with self.assertRaises(AuthenticationFailed):
            MemoryJWTAuthentication().authenticate(request)