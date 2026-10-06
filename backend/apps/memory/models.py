from django.db import models
from apps.accounts.models import ExternalUser

class Owned(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE)
    title=models.CharField(max_length=255)
    content=models.TextField(blank=True)
    locked=models.BooleanField(default=False)
    archived=models.BooleanField(default=False)
    trashed=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        abstract=True
        ordering=["-updated_at"]

class Note(Owned): pass

class Task(Owned):
    priority=models.CharField(max_length=20,default="medium")
    completed=models.BooleanField(default=False)
    favorite=models.BooleanField(default=False)
    due_at=models.DateTimeField(null=True,blank=True)
    completed_at=models.DateTimeField(null=True,blank=True)

class TaskSubtask(models.Model):
    task=models.ForeignKey(Task,on_delete=models.CASCADE,related_name="subtasks")
    title=models.CharField(max_length=255)
    completed=models.BooleanField(default=False)
    position=models.PositiveIntegerField(default=0)

class MemoryList(Owned):
    priority=models.CharField(max_length=20,default="medium")
    favorite=models.BooleanField(default=False)

class MemoryListItem(models.Model):
    memory_list=models.ForeignKey(MemoryList,on_delete=models.CASCADE,related_name="items")
    title=models.CharField(max_length=255)
    content=models.TextField(blank=True)
    completed=models.BooleanField(default=False)
    position=models.PositiveIntegerField(default=0)

class Goal(Owned):
    priority=models.CharField(max_length=20,default="medium")
    completed=models.BooleanField(default=False)
    favorite=models.BooleanField(default=False)
    target_date=models.DateField(null=True,blank=True)
    completed_at=models.DateTimeField(null=True,blank=True)

class GoalMilestone(models.Model):
    goal=models.ForeignKey(Goal,on_delete=models.CASCADE,related_name="milestones")
    title=models.CharField(max_length=255)
    description=models.TextField(blank=True)
    completed=models.BooleanField(default=False)
    target_date=models.DateField(null=True,blank=True)
    position=models.PositiveIntegerField(default=0)

class Reminder(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE)
    title=models.CharField(max_length=255)
    reminder_at=models.DateTimeField()
    completed=models.BooleanField(default=False)
    content_type=models.CharField(max_length=40,blank=True)
    object_id=models.PositiveBigIntegerField(null=True,blank=True)
    trashed=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["reminder_at"]

class Routine(Owned):
    icon=models.CharField(max_length=50,default="check")
    routine_type=models.CharField(max_length=20,default="habit")
    completion_type=models.CharField(max_length=20,default="checkbox")
    target_value=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True)
    increment_value=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True)
    unit=models.CharField(max_length=50,blank=True)
    frequency=models.CharField(max_length=20,default="daily")
    interval=models.PositiveIntegerField(default=1)
    scheduled_time=models.TimeField(null=True,blank=True)
    duration_minutes=models.PositiveIntegerField(null=True,blank=True)
    days_of_week=models.JSONField(default=list,blank=True)
    days_of_month=models.JSONField(default=list,blank=True)
    start_date=models.DateField()
    end_date=models.DateField(null=True,blank=True)
    active=models.BooleanField(default=True)

class RoutineOccurrence(models.Model):
    routine=models.ForeignKey(Routine,on_delete=models.CASCADE,related_name="occurrences")
    date=models.DateField()
    status=models.CharField(max_length=20,default="pending")
    current_value=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    note=models.TextField(blank=True)
    completed_at=models.DateTimeField(null=True,blank=True)
    class Meta:
        constraints=[models.UniqueConstraint(fields=["routine","date"],name="unique_routine_occurrence_per_day")]

class Tag(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE)
    name=models.CharField(max_length=50)
    trashed=models.BooleanField(default=False)
    class Meta:
        constraints=[models.UniqueConstraint(fields=["user","name"],name="unique_memory_tag_per_user")]

class Favorite(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE)
    content_type=models.CharField(max_length=40)
    object_id=models.PositiveBigIntegerField()
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints=[models.UniqueConstraint(fields=["user","content_type","object_id"],name="unique_memory_favorite")]

class MemoryTag(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE)
    tag=models.ForeignKey(Tag,on_delete=models.CASCADE)
    content_type=models.CharField(max_length=40)
    object_id=models.PositiveBigIntegerField()
    created_at=models.DateTimeField(auto_now_add=True)

class MemoryPin(models.Model):
    user=models.OneToOneField(ExternalUser,on_delete=models.CASCADE,related_name="memory_pin")
    pin=models.CharField(max_length=128)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta: db_table="memory_pins"
