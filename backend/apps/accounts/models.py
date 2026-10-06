from django.db import models
class ExternalUser(models.Model):
    id=models.UUIDField(primary_key=True)
    email=models.EmailField(max_length=254,blank=True)
    class Meta:
        managed=False
        db_table="accounts_user"
    @property
    def is_authenticated(self): return True
    @property
    def is_anonymous(self): return False
