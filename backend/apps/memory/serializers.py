from rest_framework import serializers
from .models import Note,Task,TaskSubtask,MemoryList,MemoryListItem,Goal,GoalMilestone,Reminder,Routine,RoutineOccurrence,Tag,Favorite,MemoryTag

class NoteSerializer(serializers.ModelSerializer):
    class Meta: model=Note; fields="__all__"; read_only_fields=["user"]
class TaskSerializer(serializers.ModelSerializer):
    class Meta: model=Task; fields="__all__"; read_only_fields=["user"]
class TaskSubtaskSerializer(serializers.ModelSerializer):
    class Meta: model=TaskSubtask; fields="__all__"
class MemoryListSerializer(serializers.ModelSerializer):
    class Meta: model=MemoryList; fields="__all__"; read_only_fields=["user"]
class MemoryListItemSerializer(serializers.ModelSerializer):
    class Meta: model=MemoryListItem; fields="__all__"
class GoalSerializer(serializers.ModelSerializer):
    class Meta: model=Goal; fields="__all__"; read_only_fields=["user"]
class GoalMilestoneSerializer(serializers.ModelSerializer):
    class Meta: model=GoalMilestone; fields="__all__"
class ReminderSerializer(serializers.ModelSerializer):
    class Meta: model=Reminder; fields="__all__"; read_only_fields=["user"]
class RoutineSerializer(serializers.ModelSerializer):
    class Meta: model=Routine; fields="__all__"; read_only_fields=["user"]
class RoutineOccurrenceSerializer(serializers.ModelSerializer):
    class Meta: model=RoutineOccurrence; fields="__all__"
class TagSerializer(serializers.ModelSerializer):
    class Meta: model=Tag; fields="__all__"; read_only_fields=["user"]
class FavoriteSerializer(serializers.ModelSerializer):
    class Meta: model=Favorite; fields="__all__"; read_only_fields=["user"]
class MemoryTagSerializer(serializers.ModelSerializer):
    class Meta: model=MemoryTag; fields="__all__"; read_only_fields=["user"]
