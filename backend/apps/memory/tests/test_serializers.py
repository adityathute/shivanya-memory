from django.test import SimpleTestCase
from apps.memory.serializers import NoteSerializer,TaskSerializer,GoalSerializer,TagSerializer
class MemorySerializerTests(SimpleTestCase):
    def test_note_requires_title(self):
        self.assertFalse(NoteSerializer(data={"content":"x"}).is_valid())
    def test_task_requires_title(self):
        self.assertFalse(TaskSerializer(data={"content":"x"}).is_valid())
    def test_goal_requires_title(self):
        self.assertFalse(GoalSerializer(data={"content":"x"}).is_valid())
    def test_tag_requires_name(self):
        self.assertFalse(TagSerializer(data={}).is_valid())