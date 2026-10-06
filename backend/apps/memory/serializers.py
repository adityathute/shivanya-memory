from rest_framework import serializers
from .models import Note,Task,TaskSubtask,MemoryList,MemoryListItem,Goal,GoalMilestone,Reminder,Routine,RoutineOccurrence,RoutineOccurrenceEntry,Tag,Favorite,MemoryTag

class NoteSerializer(serializers.ModelSerializer):
    class Meta: model=Note; fields="__all__"; read_only_fields=["user","created_at","updated_at"]
class TaskSerializer(serializers.ModelSerializer):
    class Meta: model=Task; fields="__all__"; read_only_fields=["user","created_at","updated_at","completed_at"]
class TaskSubtaskSerializer(serializers.ModelSerializer):
    class Meta: model=TaskSubtask; fields="__all__"; read_only_fields=["created_at","updated_at","completed_at"]
class MemoryListSerializer(serializers.ModelSerializer):
    class Meta: model=MemoryList; fields="__all__"; read_only_fields=["user","created_at","updated_at"]
class MemoryListItemSerializer(serializers.ModelSerializer):
    class Meta: model=MemoryListItem; fields="__all__"; read_only_fields=["created_at","updated_at","completed_at"]
class GoalSerializer(serializers.ModelSerializer):
    class Meta: model=Goal; fields="__all__"; read_only_fields=["user","created_at","updated_at","completed_at"]
class GoalMilestoneSerializer(serializers.ModelSerializer):
    class Meta: model=GoalMilestone; fields="__all__"; read_only_fields=["created_at","updated_at","completed_at"]
class ReminderSerializer(serializers.ModelSerializer):
    class Meta: model=Reminder; fields="__all__"; read_only_fields=["user","created_at","updated_at"]
class RoutineSerializer(serializers.ModelSerializer):
    class Meta: model=Routine; fields="__all__"; read_only_fields=["user","created_at","updated_at"]
class RoutineOccurrenceSerializer(serializers.ModelSerializer):
    class Meta: model=RoutineOccurrence; fields="__all__"; read_only_fields=["created_at","updated_at"]
class RoutineOccurrenceEntrySerializer(serializers.ModelSerializer):
    class Meta: model=RoutineOccurrenceEntry; fields="__all__"; read_only_fields=["recorded_at"]
class TagSerializer(serializers.ModelSerializer):
    class Meta: model=Tag; fields="__all__"; read_only_fields=["user","created_at","updated_at"]
class FavoriteSerializer(serializers.ModelSerializer):
    class Meta: model=Favorite; fields="__all__"; read_only_fields=["user","created_at"]
class MemoryTagSerializer(serializers.ModelSerializer):
    class Meta: model=MemoryTag; fields="__all__"; read_only_fields=["user","created_at"]
