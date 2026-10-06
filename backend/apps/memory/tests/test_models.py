from django.test import TestCase
from apps.memory.models import Note,Task,Goal,Routine,Tag
class MemoryModelTests(TestCase):
    def setUp(self):
        self.user=type("User",(),{"pk":"00000000-0000-0000-0000-000000000001"})()
    def test_note_defaults(self):
        note=Note(user_id=self.user.pk,title="Test")
        self.assertFalse(note.archived);self.assertFalse(note.trashed);self.assertFalse(note.locked)
    def test_task_defaults(self):
        task=Task(user_id=self.user.pk,title="Test")
        self.assertEqual(task.priority,"medium");self.assertFalse(task.completed)
    def test_goal_defaults(self):
        goal=Goal(user_id=self.user.pk,title="Test")
        self.assertEqual(goal.priority,"medium");self.assertFalse(goal.completed)
    def test_routine_defaults(self):
        routine=Routine(user_id=self.user.pk,title="Test",start_date="2026-01-01")
        self.assertEqual(routine.frequency,"daily");self.assertTrue(routine.active)
    def test_tag_model(self):
        tag=Tag(user_id=self.user.pk,name="work")
        self.assertEqual(tag.name,"work")