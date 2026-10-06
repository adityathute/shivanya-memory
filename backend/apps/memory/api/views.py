from datetime import timedelta
from secrets import token_urlsafe
from django.contrib.auth.hashers import check_password,make_password
from django.utils import timezone
from rest_framework import status,viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import *
from .serializers import *

class OwnedViewSet(viewsets.ModelViewSet):
    model=None
    serializer_class=None
    def get_queryset(self):
        qs=self.model.objects.filter(user=self.request.user)
        q=self.request.query_params.get("q","").strip()
        if q:
            qs=qs.filter(title__icontains=q)
        if self.request.query_params.get("archived")=="true": qs=qs.filter(archived=True,trashed=False)
        elif self.request.query_params.get("trashed")=="true": qs=qs.filter(trashed=True)
        else: qs=qs.filter(archived=False,trashed=False)
        if self.request.query_params.get("favorite")=="true": qs=qs.filter(favorite=True)
        if self.request.query_params.get("locked")=="true": qs=qs.filter(locked=True)
        if hasattr(self.model,"priority") and self.request.query_params.get("priority"): qs=qs.filter(priority=self.request.query_params["priority"])
        return qs
    def perform_create(self,serializer): serializer.save(user=self.request.user)
    def perform_update(self,serializer): serializer.save(user=self.request.user)
    def perform_destroy(self,instance):
        instance.trashed=True;instance.trashed_at=timezone.now();instance.archived=False;instance.archived_at=None;instance.save()
    @action(detail=True,methods=["post"])
    def archive(self,request,pk=None):
        obj=self.model.objects.get(pk=pk,user=request.user);obj.archived=True;obj.archived_at=timezone.now();obj.trashed=False;obj.trashed_at=None;obj.save();return Response(self.get_serializer(obj).data)
    @action(detail=True,methods=["post"])
    def restore(self,request,pk=None):
        obj=self.model.objects.get(pk=pk,user=request.user);obj.archived=False;obj.archived_at=None;obj.trashed=False;obj.trashed_at=None;obj.save();return Response(self.get_serializer(obj).data)
    @action(detail=True,methods=["post"])
    def trash(self,request,pk=None):
        obj=self.model.objects.get(pk=pk,user=request.user);obj.trashed=True;obj.trashed_at=timezone.now();obj.archived=False;obj.archived_at=None;obj.save();return Response(self.get_serializer(obj).data)
    @action(detail=True,methods=["post"])
    def favorite(self,request,pk=None):
        obj=self.get_object();obj.favorite=not obj.favorite;obj.save(update_fields=["favorite","updated_at"]);return Response(self.get_serializer(obj).data)
    @action(detail=True,methods=["post"])
    def lock(self,request,pk=None):
        obj=self.get_object();obj.locked=not obj.locked;obj.save(update_fields=["locked","updated_at"]);return Response(self.get_serializer(obj).data)
    @action(detail=True,methods=["post"])
    def complete(self,request,pk=None):
        obj=self.get_object()
        if hasattr(obj,"completed"):
            obj.completed=not obj.completed
            obj.completed_at=timezone.now() if obj.completed else None
            obj.save(update_fields=["completed","completed_at","updated_at"])
        return Response(self.get_serializer(obj).data)

class NoteViewSet(OwnedViewSet): model=Note;serializer_class=NoteSerializer
class TaskViewSet(OwnedViewSet): model=Task;serializer_class=TaskSerializer
class MemoryListViewSet(OwnedViewSet): model=MemoryList;serializer_class=MemoryListSerializer
class GoalViewSet(OwnedViewSet): model=Goal;serializer_class=GoalSerializer
class RoutineViewSet(OwnedViewSet): model=Routine;serializer_class=RoutineSerializer

class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class=ReminderSerializer
    def get_queryset(self):
        qs=Reminder.objects.filter(user=self.request.user)
        q=self.request.query_params.get("q","").strip()
        if q: qs=qs.filter(title__icontains=q)
        if self.request.query_params.get("trashed")=="true": return qs.filter(trashed=True)
        return qs.filter(trashed=False)
    def perform_create(self,serializer): serializer.save(user=self.request.user)
    def perform_destroy(self,instance): instance.trashed=True;instance.trashed_at=timezone.now();instance.save()
    @action(detail=True,methods=["post"])
    def complete(self,request,pk=None):
        obj=self.get_object();obj.completed=not obj.completed;obj.save(update_fields=["completed","updated_at"]);return Response(self.get_serializer(obj).data)

class TagViewSet(viewsets.ModelViewSet):
    serializer_class=TagSerializer
    def get_queryset(self):
        qs=Tag.objects.filter(user=self.request.user)
        q=self.request.query_params.get("q","").strip()
        if q: qs=qs.filter(name__icontains=q)
        return qs.filter(trashed=self.request.query_params.get("trashed")=="true")
    def perform_create(self,serializer): serializer.save(user=self.request.user)
    def perform_destroy(self,instance): instance.trashed=True;instance.trashed_at=timezone.now();instance.save()

class ChildViewSet(viewsets.ModelViewSet):
    parent_field=""
    parent_model=None
    def get_queryset(self): return self.model.objects.filter(**{self.parent_field+"__user":self.request.user})
    def perform_create(self,serializer):
        parent_id=self.request.data.get(self.parent_field)
        parent=self.parent_model.objects.get(pk=parent_id,user=self.request.user)
        serializer.save(**{self.parent_field:parent})

class TaskSubtaskViewSet(ChildViewSet):
    model=TaskSubtask;parent_field="task";parent_model=Task;serializer_class=TaskSubtaskSerializer
class ListItemViewSet(ChildViewSet):
    model=MemoryListItem;parent_field="memory_list";parent_model=MemoryList;serializer_class=MemoryListItemSerializer
class GoalMilestoneViewSet(ChildViewSet):
    model=GoalMilestone;parent_field="goal";parent_model=Goal;serializer_class=GoalMilestoneSerializer

class RoutineOccurrenceViewSet(viewsets.ModelViewSet):
    model=RoutineOccurrence;serializer_class=RoutineOccurrenceSerializer
    def get_queryset(self): return RoutineOccurrence.objects.filter(routine__user=self.request.user)
    def perform_create(self,serializer): serializer.save(routine=Routine.objects.get(pk=self.request.data.get("routine"),user=self.request.user))
    @action(detail=True,methods=["post"])
    def complete(self,request,pk=None):
        o=self.get_object();o.status="completed";o.completed_at=timezone.now();o.save();return Response(self.get_serializer(o).data)
    @action(detail=True,methods=["post"])
    def skip(self,request,pk=None):
        o=self.get_object();o.status="skipped";o.skipped_at=timezone.now();o.save();return Response(self.get_serializer(o).data)

class RoutineOccurrenceEntryViewSet(viewsets.ModelViewSet):
    serializer_class=RoutineOccurrenceEntrySerializer
    def get_queryset(self): return RoutineOccurrenceEntry.objects.filter(occurrence__routine__user=self.request.user)
    def perform_create(self,serializer): serializer.save(occurrence=RoutineOccurrence.objects.get(pk=self.request.data.get("occurrence"),routine__user=self.request.user))

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class=FavoriteSerializer
    def get_queryset(self): return Favorite.objects.filter(user=self.request.user)
    def perform_create(self,serializer): serializer.save(user=self.request.user)

class MemoryTagViewSet(viewsets.ModelViewSet):
    serializer_class=MemoryTagSerializer
    def get_queryset(self): return MemoryTag.objects.filter(user=self.request.user)
    def perform_create(self,serializer): serializer.save(user=self.request.user)

class DashboardView(APIView):
    def get(self,request):
        user=request.user
        return Response({"notes":Note.objects.filter(user=user,trashed=False,archived=False).count(),"tasks":Task.objects.filter(user=user,trashed=False,archived=False).count(),"completed_tasks":Task.objects.filter(user=user,completed=True,trashed=False).count(),"lists":MemoryList.objects.filter(user=user,trashed=False,archived=False).count(),"goals":Goal.objects.filter(user=user,trashed=False,archived=False).count(),"routines":Routine.objects.filter(user=user,active=True,trashed=False,archived=False).count(),"reminders":Reminder.objects.filter(user=user,completed=False,trashed=False).count(),"tags":Tag.objects.filter(user=user,trashed=False).count()})

class TrashView(APIView):
    def get(self,request):
        user=request.user;items=[]
        for model,serializer,name in [(Note,NoteSerializer,"note"),(Task,TaskSerializer,"task"),(MemoryList,MemoryListSerializer,"list"),(Goal,GoalSerializer,"goal"),(Routine,RoutineSerializer,"routine"),(Reminder,ReminderSerializer,"reminder"),(Tag,TagSerializer,"tag")]:
            for obj in model.objects.filter(user=user,trashed=True):
                data=serializer(obj).data;data["type"]=name;items.append(data)
        items.sort(key=lambda x:x.get("trashed_at") or "",reverse=True);return Response(items)
    def post(self,request):
        model_map={"note":Note,"task":Task,"list":MemoryList,"goal":Goal,"routine":Routine,"reminder":Reminder,"tag":Tag}
        model=model_map.get(request.data.get("type"))
        if not model:return Response({"detail":"Invalid type."},status=400)
        try: obj=model.objects.get(pk=request.data.get("id"),user=request.user,trashed=True)
        except model.DoesNotExist:return Response({"detail":"Item not found."},status=404)
        obj.trashed=False;obj.trashed_at=None;obj.save();return Response({"restored":True})
    def delete(self,request):
        model_map={"note":Note,"task":Task,"list":MemoryList,"goal":Goal,"routine":Routine,"reminder":Reminder,"tag":Tag}
        model=model_map.get(request.data.get("type"))
        if not model:return Response({"detail":"Invalid type."},status=400)
        try: obj=model.objects.get(pk=request.data.get("id"),user=request.user,trashed=True)
        except model.DoesNotExist:return Response({"detail":"Item not found."},status=404)
        obj.delete();return Response(status=204)

class ArchiveView(APIView):
    def get(self,request):
        user=request.user;items=[]
        for model,serializer,name in [(Note,NoteSerializer,"note"),(Task,TaskSerializer,"task"),(MemoryList,MemoryListSerializer,"list"),(Goal,GoalSerializer,"goal"),(Routine,RoutineSerializer,"routine")]:
            for obj in model.objects.filter(user=user,archived=True,trashed=False):
                data=serializer(obj).data;data["type"]=name;items.append(data)
        return Response(items)

class MemoryPinStatusView(APIView):
    def get(self,request): return Response({"has_pin":MemoryPin.objects.filter(user=request.user).exists()})

class MemoryPinVerifyView(APIView):
    def post(self,request):
        record=MemoryPin.objects.filter(user=request.user).first()
        if not record or not check_password(str(request.data.get("pin","")),record.pin): return Response({"detail":"Invalid Memory PIN."},status=400)
        return Response({"verified":True})

class MemoryPinChangeView(APIView):
    def post(self,request):
        current=str(request.data.get("current_pin",""));new=str(request.data.get("new_pin",""))
        if len(new)!=4 or not new.isdigit(): return Response({"detail":"Memory PIN must be 4 digits."},status=400)
        record=MemoryPin.objects.filter(user=request.user).first()
        if record and not check_password(current,record.pin): return Response({"detail":"Current Memory PIN is incorrect."},status=400)
        if record: record.pin=make_password(new);record.save(update_fields=["pin","updated_at"])
        else: MemoryPin.objects.create(user=request.user,pin=make_password(new))
        return Response({"message":"Memory PIN saved."})

class MemoryPinResetRequestView(APIView):
    def post(self,request):
        from django.contrib.auth.hashers import check_password
        password=str(request.data.get("current_password",""))
        if not password or not check_password(password,getattr(request.user,"password","")):
            return Response({"detail":"Current account password is incorrect."},status=400)
        token=token_urlsafe(48)
        MemoryPinReset.objects.create(user=request.user,token=token,expires_at=timezone.now()+timedelta(minutes=15))
        return Response({"token":token})

class MemoryPinResetView(APIView):
    def post(self,request):
        token=str(request.data.get("token",""));new=str(request.data.get("new_pin",""))
        if len(new)!=4 or not new.isdigit(): return Response({"detail":"Memory PIN must be 4 digits."},status=400)
        record=MemoryPinReset.objects.filter(token=token,used_at__isnull=True,expires_at__gt=timezone.now()).first()
        if not record:return Response({"detail":"Reset token is invalid or expired."},status=400)
        pin,created=MemoryPin.objects.get_or_create(user=record.user,defaults={"pin":make_password(new)})
        if not created:pin.pin=make_password(new);pin.save(update_fields=["pin","updated_at"])
        record.used_at=timezone.now();record.save(update_fields=["used_at"]);return Response({"message":"Memory PIN reset."})
