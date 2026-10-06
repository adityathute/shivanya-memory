from rest_framework import serializers
from .models import Note,Task,TaskSubtask,MemoryList,MemoryListItem,Goal,GoalMilestone,Reminder,Routine,RoutineOccurrence,RoutineOccurrenceEntry,Tag,Favorite,MemoryTag

class NoteSerializer(serializers.ModelSerializer):
    class Meta: model=Note; fields="__all__"; read_only_fields=["user","created_at","updated_at"]
class TaskSerializer(serializers.ModelSerializer):
    subtasks=TaskSubtaskSerializer(many=True,read_only=True)
    subtask_count=serializers.SerializerMethodField()
    completed_subtask_count=serializers.SerializerMethodField()
    progress=serializers.SerializerMethodField()
    def get_subtask_count(self,obj): return obj.subtasks.count()
    def get_completed_subtask_count(self,obj): return obj.subtasks.filter(completed=True).count()
    def get_progress(self,obj):
        total=obj.subtasks.count()
        return 100 if total==0 and obj.completed else 0 if total==0 else round(obj.subtasks.filter(completed=True).count()/total*100)
    class Meta: model=Task; fields="__all__"; read_only_fields=["user","created_at","updated_at","completed_at"]
class TaskSubtaskSerializer(serializers.ModelSerializer):
    class Meta: model=TaskSubtask; fields="__all__"; read_only_fields=["created_at","updated_at","completed_at"]
class MemoryListSerializer(serializers.ModelSerializer):
    items=MemoryListItemSerializer(many=True,read_only=True)
    item_count=serializers.SerializerMethodField()
    completed_item_count=serializers.SerializerMethodField()
    progress=serializers.SerializerMethodField()
    def get_item_count(self,obj): return obj.items.count()
    def get_completed_item_count(self,obj): return obj.items.filter(completed=True).count()
    def get_progress(self,obj):
        total=obj.items.count()
        return 0 if total==0 else round(obj.items.filter(completed=True).count()/total*100)
    class Meta: model=MemoryList; fields="__all__"; read_only_fields=["user","created_at","updated_at"]
class MemoryListItemSerializer(serializers.ModelSerializer):
    class Meta: model=MemoryListItem; fields="__all__"; read_only_fields=["created_at","updated_at","completed_at"]
class GoalSerializer(serializers.ModelSerializer):
    milestones=GoalMilestoneSerializer(many=True,read_only=True)
    progress=serializers.SerializerMethodField()
    def get_progress(self,obj):
        total=obj.milestones.count()
        return 100 if total==0 and obj.completed else 0 if total==0 else round(obj.milestones.filter(completed=True).count()/total*100)
    class Meta: model=Goal; fields="__all__"; read_only_fields=["user","created_at","updated_at","completed_at"]
class GoalMilestoneSerializer(serializers.ModelSerializer):
    class Meta: model=GoalMilestone; fields="__all__"; read_only_fields=["created_at","updated_at","completed_at"]
class ReminderSerializer(serializers.ModelSerializer):
    class Meta: model=Reminder; fields="__all__"; read_only_fields=["user","created_at","updated_at"]
class RoutineSerializer(serializers.ModelSerializer):
    occurrences=RoutineOccurrenceSerializer(many=True,read_only=True)
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
