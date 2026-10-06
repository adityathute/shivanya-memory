from django.urls import include,path
from rest_framework.routers import DefaultRouter
from .views import *
router=DefaultRouter()
router.register("notes",NoteViewSet,basename="notes")
router.register("tasks",TaskViewSet,basename="tasks")
router.register("lists",MemoryListViewSet,basename="lists")
router.register("goals",GoalViewSet,basename="goals")
router.register("reminders",ReminderViewSet,basename="reminders")
router.register("routines",RoutineViewSet,basename="routines")
router.register("tags",TagViewSet,basename="tags")
router.register("favorites",FavoriteViewSet,basename="favorites")
router.register("subtasks",TaskSubtaskViewSet,basename="subtasks")
router.register("list-items",ListItemViewSet,basename="list-items")
router.register("milestones",GoalMilestoneViewSet,basename="milestones")
urlpatterns=[path("",include(router.urls)),path("pin/status/",MemoryPinStatusView.as_view()),path("pin/verify/",MemoryPinVerifyView.as_view()),path("pin/change/",MemoryPinChangeView.as_view()),path("archive/",ArchiveView.as_view()),path("trash/",TrashView.as_view())]
