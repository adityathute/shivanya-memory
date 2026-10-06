from django.contrib.auth.hashers import check_password,make_password
from django.shortcuts import get_object_or_404
from rest_framework import status,viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import *
from .serializers import *

class OwnedViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return self.model.objects.filter(user=self.request.user)
    def perform_create(self,serializer): serializer.save(user=self.request.user)
    def perform_update(self,serializer):
        obj=self.get_object()
        serializer.save(user=obj.user)

class NoteViewSet(OwnedViewSet): model=Note; serializer_class=NoteSerializer
class TaskViewSet(OwnedViewSet): model=Task; serializer_class=TaskSerializer
class MemoryListViewSet(OwnedViewSet): model=MemoryList; serializer_class=MemoryListSerializer
class GoalViewSet(OwnedViewSet): model=Goal; serializer_class=GoalSerializer
class ReminderViewSet(OwnedViewSet): model=Reminder; serializer_class=ReminderSerializer
class RoutineViewSet(OwnedViewSet): model=Routine; serializer_class=RoutineSerializer
class TagViewSet(OwnedViewSet): model=Tag; serializer_class=TagSerializer
class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class=FavoriteSerializer
    def get_queryset(self): return Favorite.objects.filter(user=self.request.user)
    def perform_create(self,serializer): serializer.save(user=self.request.user)

class TaskSubtaskViewSet(viewsets.ModelViewSet):
    serializer_class=TaskSubtaskSerializer
    def get_queryset(self): return TaskSubtask.objects.filter(task__user=self.request.user)
class ListItemViewSet(viewsets.ModelViewSet):
    serializer_class=MemoryListItemSerializer
    def get_queryset(self): return MemoryListItem.objects.filter(memory_list__user=self.request.user)
class GoalMilestoneViewSet(viewsets.ModelViewSet):
    serializer_class=GoalMilestoneSerializer
    def get_queryset(self): return GoalMilestone.objects.filter(goal__user=self.request.user)

class MemoryPinStatusView(APIView):
    def get(self,request):
        return Response({"has_pin":MemoryPin.objects.filter(user=request.user).exists()})
class MemoryPinVerifyView(APIView):
    def post(self,request):
        pin=str(request.data.get("pin",""))
        record=MemoryPin.objects.filter(user=request.user).first()
        if not record or not check_password(pin,record.pin): return Response({"detail":"Invalid Memory PIN."},status=400)
        return Response({"verified":True})
class MemoryPinChangeView(APIView):
    def post(self,request):
        current=str(request.data.get("current_pin",""))
        new=str(request.data.get("new_pin",""))
        if len(new)!=4 or not new.isdigit(): return Response({"detail":"Memory PIN must be 4 digits."},status=400)
        record=MemoryPin.objects.filter(user=request.user).first()
        if record and not check_password(current,record.pin): return Response({"detail":"Current Memory PIN is incorrect."},status=400)
        if record: record.pin=make_password(new);record.save(update_fields=["pin","updated_at"])
        else: MemoryPin.objects.create(user=request.user,pin=make_password(new))
        return Response({"message":"Memory PIN saved."})

class ArchiveView(APIView):
    def get(self,request):
        return Response({"notes":NoteSerializer(Note.objects.filter(user=request.user,archived=True,trashed=False),many=True).data})
class TrashView(APIView):
    def get(self,request):
        return Response({"notes":NoteSerializer(Note.objects.filter(user=request.user,trashed=True),many=True).data})
