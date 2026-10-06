from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from apps.accounts.models import ExternalUser
class MemoryJWTAuthentication(JWTAuthentication):
    def authenticate(self,request):
        header=self.get_header(request)
        if not header:return None
        raw=self.get_raw_token(header)
        if raw is None:return None
        validated=self.get_validated_token(raw)
        user_id=validated.get("user_id")
        if not user_id:raise AuthenticationFailed("User identity is missing.")
        try:user=ExternalUser.objects.get(id=user_id)
        except ExternalUser.DoesNotExist as exc:raise AuthenticationFailed("User not found.") from exc
        return user,validated
