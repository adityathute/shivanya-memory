from django.db import models
from apps.accounts.models import ExternalUser

class Owned(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE,db_constraint=False)
    title=models.CharField(max_length=255)
    content=models.TextField(blank=True)
    locked=models.BooleanField(default=False)
    favorite=models.BooleanField(default=False)
    archived=models.BooleanField(default=False)
    archived_at=models.DateTimeField(null=True,blank=True)
    trashed=models.BooleanField(default=False)
    trashed_at=models.DateTimeField(null=True,blank=True)
    position=models.PositiveIntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        abstract=True
        ordering=["position","-updated_at"]

class Note(Owned): pass

class Task(Owned):
    priority=models.CharField(max_length=20,default="medium")
    completed=models.BooleanField(default=False)
    start_at=models.DateTimeField(null=True,blank=True)
    due_at=models.DateTimeField(null=True,blank=True)
    completed_at=models.DateTimeField(null=True,blank=True)
    estimated_minutes=models.PositiveIntegerField(null=True,blank=True)
    actual_minutes=models.PositiveIntegerField(null=True,blank=True)

class TaskSubtask(models.Model):
    task=models.ForeignKey(Task,on_delete=models.CASCADE,related_name="subtasks")
    title=models.CharField(max_length=255)
    completed=models.BooleanField(default=False)
    completed_at=models.DateTimeField(null=True,blank=True)
    position=models.PositiveIntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

class MemoryList(Owned):
    priority=models.CharField(max_length=20,default="medium")

class MemoryListItem(models.Model):
    memory_list=models.ForeignKey(MemoryList,on_delete=models.CASCADE,related_name="items")
    title=models.CharField(max_length=255)
    content=models.TextField(blank=True)
    completed=models.BooleanField(default=False)
    completed_at=models.DateTimeField(null=True,blank=True)
    position=models.PositiveIntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

class Goal(Owned):
    priority=models.CharField(max_length=20,default="medium")
    completed=models.BooleanField(default=False)
    target_date=models.DateField(null=True,blank=True)
    completed_at=models.DateTimeField(null=True,blank=True)

class GoalMilestone(models.Model):
    goal=models.ForeignKey(Goal,on_delete=models.CASCADE,related_name="milestones")
    title=models.CharField(max_length=255)
    description=models.TextField(blank=True)
    completed=models.BooleanField(default=False)
    completed_at=models.DateTimeField(null=True,blank=True)
    target_date=models.DateField(null=True,blank=True)
    position=models.PositiveIntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

class Reminder(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE,db_constraint=False)
    title=models.CharField(max_length=255)
    reminder_at=models.DateTimeField()
    completed=models.BooleanField(default=False)
    content_type=models.CharField(max_length=40,blank=True)
    object_id=models.PositiveBigIntegerField(null=True,blank=True)
    trashed=models.BooleanField(default=False)
    trashed_at=models.DateTimeField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["reminder_at"]

class Routine(Owned):
    icon=models.CharField(max_length=50,default="check",blank=True)
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
    task=models.ForeignKey(Task,on_delete=models.SET_NULL,null=True,blank=True,related_name="routines")
    memory_list=models.ForeignKey(MemoryList,on_delete=models.SET_NULL,null=True,blank=True,related_name="routines")
    goal=models.ForeignKey(Goal,on_delete=models.SET_NULL,null=True,blank=True,related_name="routines")
    milestone=models.ForeignKey(GoalMilestone,on_delete=models.SET_NULL,null=True,blank=True,related_name="routines")

class RoutineOccurrence(models.Model):
    routine=models.ForeignKey(Routine,on_delete=models.CASCADE,related_name="occurrences")
    date=models.DateField()
    scheduled_time=models.TimeField(null=True,blank=True)
    target_value=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True)
    current_value=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    status=models.CharField(max_length=20,default="pending")
    completed_at=models.DateTimeField(null=True,blank=True)
    started_at=models.DateTimeField(null=True,blank=True)
    actual_duration_minutes=models.PositiveIntegerField(null=True,blank=True)
    start_late_by_minutes=models.PositiveIntegerField(default=0)
    duration_overrun_minutes=models.PositiveIntegerField(default=0)
    late_by_minutes=models.PositiveIntegerField(default=0)
    skipped_at=models.DateTimeField(null=True,blank=True)
    note=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        constraints=[models.UniqueConstraint(fields=["routine","date"],name="unique_routine_occurrence_per_day")]

class RoutineOccurrenceEntry(models.Model):
    occurrence=models.ForeignKey(RoutineOccurrence,on_delete=models.CASCADE,related_name="entries")
    value=models.DecimalField(max_digits=12,decimal_places=2)
    recorded_at=models.DateTimeField(auto_now_add=True)
    note=models.TextField(blank=True)

class Tag(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE,db_constraint=False)
    name=models.CharField(max_length=50)
    trashed=models.BooleanField(default=False)
    trashed_at=models.DateTimeField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        constraints=[models.UniqueConstraint(fields=["user","name"],name="unique_memory_tag_per_user")]

class Favorite(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE,db_constraint=False)
    content_type=models.CharField(max_length=40)
    object_id=models.PositiveBigIntegerField()
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints=[models.UniqueConstraint(fields=["user","content_type","object_id"],name="unique_memory_favorite")]

class MemoryTag(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE,db_constraint=False)
    tag=models.ForeignKey(Tag,on_delete=models.CASCADE)
    content_type=models.CharField(max_length=40)
    object_id=models.PositiveBigIntegerField()
    created_at=models.DateTimeField(auto_now_add=True)

class MemoryPin(models.Model):
    user=models.OneToOneField(ExternalUser,on_delete=models.CASCADE,db_constraint=False,related_name="memory_pin")
    pin=models.CharField(max_length=128)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

class MemoryPinReset(models.Model):
    user=models.ForeignKey(ExternalUser,on_delete=models.CASCADE,db_constraint=False)
    token=models.CharField(max_length=128,unique=True)
    expires_at=models.DateTimeField()
    used_at=models.DateTimeField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
