from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from apps.accounts.models import AuthSession,ExternalUser
class MemoryJWTAuthentication(JWTAuthentication):
    def authenticate(self,request):
        header=self.get_header(request)
        if not header:return None
        raw=self.get_raw_token(header)
        if raw is None:return None
        validated=self.get_validated_token(raw)
        user_id=validated.get("user_id")
        session_id=validated.get("session_id")
        if not user_id or not session_id:raise AuthenticationFailed("Authentication session is missing.")
        try:user=ExternalUser.objects.get(id=user_id)
        except ExternalUser.DoesNotExist as exc:raise AuthenticationFailed("User not found.") from exc
        if not AuthSession.objects.filter(id=session_id,user=user,revoked_at__isnull=True).exists():raise AuthenticationFailed("Your session has been signed out.")
        return user,validated
