from django.db import models
class ExternalUser(models.Model):
    id=models.UUIDField(primary_key=True)
    email=models.EmailField(max_length=254,blank=True)
    class Meta:
        managed=False
        db_table="accounts_user"
