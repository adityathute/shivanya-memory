"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import {
  Button,
  Typography,
  FileTextIcon,
  TasksIcon,
  ListsIcon,
  ArchiveIcon,
  FavoriteIcon,
  LockIcon,
  PlusIcon,
  HomeIcon,
  GoalIcon,
  BellIcon,
  ChevronRightIcon,
  RoutineIcon,
  TagsIcon,
} from "shivanya-ui";

import { apiClient, API_ENDPOINTS } from "@/lib/auth";
import RoutineIconMap from "../routine/components/RoutineIconMap";
import styles from "./DashboardPage.module.css";
import NotesCreate from "../notes/components/NotesCreate";
import useNotes from "../notes/hooks/useNotes";
import TasksCreate from "../tasks/components/TasksCreate";
import useTasks from "../tasks/hooks/useTasks";
import ListsCreate from "../lists/components/ListsCreate";
import useLists from "../lists/hooks/useLists";
import GoalsCreate from "../goals/components/GoalsCreate";
import useGoals from "../goals/hooks/useGoals";
import RoutineCreate from "../routine/components/RoutineCreate";
import useRoutine from "../routine/hooks/useRoutine";

const TYPE_CONFIG = {
  note: {
    label: "Notes",
    icon: FileTextIcon,
    className: "notes",
    path: "/notes",
  },

  task: {
    label: "Tasks",
    icon: TasksIcon,
    className: "tasks",
    path: "/tasks",
  },

  list: {
    label: "Lists",
    icon: ListsIcon,
    className: "lists",
    path: "/lists",
  },

  goal: {
    label: "Goals",
    icon: GoalIcon,
    className: "goals",
    path: "/goals",
  },

  reminder: {
    label: "Reminders",
    icon: TasksIcon,
    className: "reminders",
    path: "/reminders",
  },

  routine: {
    label: "Routines",
    icon: RoutineIcon,
    className: "routines",
    path: "/routine",
  },
};

export default function DashboardPageClient() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createType, setCreateType] = useState(null);
  const createMenuRef = useRef(null);
  const notes = useNotes();
  const tasks = useTasks();
  const lists = useLists();
  const goals = useGoals();
  const routines = useRoutine();

  const loadDashboard = useCallback(async ({ showSkeleton = false } = {}) => {
    try {
      if (showSkeleton) {
        setLoading(true);
      }

      setError("");

      const response = await apiClient(API_ENDPOINTS.MEMORY.DASHBOARD, {
        method: "GET",
      });

      setDashboard(response || {});
    } catch (requestError) {
      setError(requestError?.message || "Unable to load dashboard.");
    } finally {
      if (showSkeleton) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient(API_ENDPOINTS.MEMORY.DASHBOARD, {
          method: "GET",
        });

        if (!cancelled) {
          setDashboard(response || {});
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError?.message || "Unable to load dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target)
      ) {
        setCreateMenuOpen(false);
      }
    }

    if (createMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [createMenuOpen]);

  const createItems = [
    {
      type: "note",
      label: "Note",
      path: "/notes",
      icon: <FileTextIcon size={18} />,
      iconClass: styles.dashboardCreateIconNotes,
    },
    {
      type: "task",
      label: "Task",
      path: "/tasks",
      icon: <TasksIcon size={18} />,
      iconClass: styles.dashboardCreateIconTasks,
    },
    {
      type: "list",
      label: "List",
      path: "/lists",
      icon: <ListsIcon size={18} />,
      iconClass: styles.dashboardCreateIconLists,
    },
    {
      type: "goal",
      label: "Goal",
      path: "/goals",
      icon: <GoalIcon size={18} />,
      iconClass: styles.dashboardCreateIconGoals,
    },
    {
      type: "routine",
      label: "Routine",
      path: "/routine",
      icon: <RoutineIcon size={18} />,
      iconClass: styles.dashboardCreateIconRoutines,
    },
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient(API_ENDPOINTS.MEMORY.DASHBOARD, {
          method: "GET",
        });

        if (!cancelled) {
          setDashboard(response || {});
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError?.message || "Unable to load dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => dashboard?.stats || {}, [dashboard]);

  const recentItems = useMemo(
    () =>
      Array.isArray(dashboard?.recent_items)
        ? dashboard.recent_items.slice(0, 7)
        : [],
    [dashboard],
  );

  const reminders = useMemo(
    () =>
      Array.isArray(dashboard?.upcoming_reminders)
        ? dashboard.upcoming_reminders
        : [],
    [dashboard],
  );

  const todayRoutines = routines.todayRoutines;

  const todayItems = useMemo(() => {
    const pendingRoutines = todayRoutines.filter(
      (routine) => routine?.occurrence?.status === "pending",
    ).length;

    const today = new Date();

    const remindersToday = reminders.filter((reminder) => {
      if (!reminder?.reminder_at) {
        return false;
      }

      const reminderDate = new Date(reminder.reminder_at);

      return (
        reminderDate.getFullYear() === today.getFullYear() &&
        reminderDate.getMonth() === today.getMonth() &&
        reminderDate.getDate() === today.getDate()
      );
    }).length;

    return pendingRoutines + remindersToday;
  }, [todayRoutines, reminders]);

  /*
   * ================================================================
   * TASK COMPLETION
   *
   * Includes:
   * - Parent Tasks
   * - Task Subtasks
   * ================================================================
   */

  const taskCompletion = getCompletionPercent(
    stats.completed_task_work,
    stats.task_work_total,
  );

  /*
   * ================================================================
   * LIST COMPLETION
   *
   * Includes:
   * - MemoryListItem
   * ================================================================
   */

  const listCompletion = getCompletionPercent(
    stats.completed_list_items,
    stats.list_items,
  );

  /*
   * ================================================================
   * GOAL COMPLETION
   *
   * Includes:
   * - GoalMilestone
   * ================================================================
   */

  const goalCompletion = getCompletionPercent(
    stats.completed_goal_milestones,
    stats.goal_milestones,
  );

  /*
   * ================================================================
   * ROUTINE COMPLETION
   *
   * ================================================================
   */

  const routineOccurrenceList = Object.values(
    routines.occurrences || {},
  ).filter(Boolean);

  const routineTotal = routineOccurrenceList.length;

  const routineCompleted = routineOccurrenceList.filter(
    (occurrence) =>
      occurrence?.completed ||
      occurrence?.completed_at ||
      occurrence?.status === "completed",
  ).length;

  const routineCompletion = getCompletionPercent(
    routineCompleted,
    routineTotal,
  );

  /*
   * ================================================================
   * TOTAL TOP-LEVEL MEMORY
   *
   * This remains Notes + Tasks + Lists + Goals.
   * Subtasks/items/milestones are children, so they are not
   * counted again here.
   * ================================================================
   */

  const totalItems =
    toNumber(stats.notes) +
    toNumber(stats.tasks) +
    toNumber(stats.lists) +
    toNumber(stats.goals);

  const hasDashboardData =
    totalItems > 0 || toNumber(stats.routines) > 0 || todayRoutines.length > 0;

  /*
   * ================================================================
   * ACTIVE WORK
   *
   * Uses actual unfinished work:
   *
   * - Pending Tasks
   * - Pending Subtasks
   * - Pending List Items
   * - Pending Goal Milestones
   * ================================================================
   */

  const activeItems =
    toNumber(stats.pending_tasks) +
    toNumber(stats.pending_subtasks) +
    toNumber(stats.pending_list_items) +
    toNumber(stats.pending_goal_milestones);

  /*
   * ================================================================
   * COMPLETION SUMMARY
   * ================================================================
   */

  const completionSummary = [
    {
      label: "Tasks",
      value: taskCompletion,
      completed: toNumber(stats.completed_task_work),
      total: toNumber(stats.task_work_total),
      className: "tasks",
    },

    {
      label: "Lists",
      value: listCompletion,
      completed: toNumber(stats.completed_list_items),
      total: toNumber(stats.list_items),
      className: "lists",
    },

    {
      label: "Goals",
      value: goalCompletion,
      completed: toNumber(stats.completed_goal_milestones),
      total: toNumber(stats.goal_milestones),
      className: "goals",
    },

    {
      label: "Routines",
      value: routineCompletion,
      completed: routineCompleted,
      total: routineTotal,
      className: "routines",
    },
  ];

  if (loading || routines.loading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className={styles.dashboardPage}>
      {" "}
      <header className={styles.dashboardHeader}>
        {" "}
        <div className={styles.dashboardHeading}>
          {" "}
          <div className={styles.dashboardHeadingRow}>
            {" "}
            <span className={styles.dashboardHeadingIcon}>
              {" "}
              <HomeIcon size={19} />{" "}
            </span>
            <Typography as="h1" variant="h2" size="lg" weight="semibold">
              Dashboard
            </Typography>
          </div>
          <Typography as="p" variant="bodySmall" size="sm" color="secondary">
            Stay organized and get things done.
          </Typography>
        </div>
        <div ref={createMenuRef} className={styles.dashboardActions}>
          <Button
            size="md"
            type="button"
            className={styles.dashboardCreateButton}
            startIcon={<PlusIcon size={26} />}
            onClick={() => {
              setCreateMenuOpen((open) => !open);
            }}
            aria-label="Create"
            aria-expanded={createMenuOpen}
          />

          {createMenuOpen && (
            <div className={styles.dashboardCreateMenu}>
              {createItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={styles.dashboardCreateMenuItem}
                  onClick={() => {
                    setCreateMenuOpen(false);
                    setCreateType(item.type);

                    if (item.type === "note") {
                      notes.handleCreateNote();
                    }

                    if (item.type === "task") {
                      tasks.handleCreateTask();
                    }

                    if (item.type === "list") {
                      lists.handleCreateList();
                    }

                    if (item.type === "goal") {
                      goals.handleCreateGoal();
                    }

                    if (item.type === "routine") {
                      routines.handleCreateRoutine();
                    }
                  }}
                >
                  <span
                    className={`${styles.dashboardCreateItemIcon} ${item.iconClass}`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>

                  <ChevronRightIcon
                    size={15}
                    className={styles.dashboardCreateArrow}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      {error && (
        <div className={styles.dashboardError}>
          <Typography as="p" variant="bodySmall" size="sm">
            {error}
          </Typography>
        </div>
      )}
      {!hasDashboardData ? (
        <EmptyDashboard
          onCreate={() => {
            setCreateMenuOpen(true);
          }}
          createItems={createItems}
        />
      ) : (
        <>
          <section
            className={styles.dashboardStats}
            aria-label="Memory statistics"
          >
            <StatCard
              type="notes"
              icon={<FileTextIcon size={18} />}
              label="Notes"
              value={stats.notes || 0}
              href="/notes"
            />

            <StatCard
              type="tasks"
              icon={<TasksIcon size={18} />}
              label="Tasks"
              value={stats.tasks || 0}
              meta={`${stats.completed_tasks || 0} completed`}
              href="/tasks"
            />

            <StatCard
              type="lists"
              icon={<ListsIcon size={18} />}
              label="Lists"
              value={stats.lists || 0}
              meta={
                stats.list_items != null
                  ? `${stats.list_items} items`
                  : undefined
              }
              href="/lists"
            />

            <StatCard
              type="goals"
              icon={<GoalIcon size={18} />}
              label="Goals"
              value={stats.goals || 0}
              meta={`${stats.completed_goals || 0} completed`}
              href="/goals"
            />

            <StatCard
              type="routines"
              icon={<RoutineIcon size={18} />}
              label="Routines"
              value={stats.routines || 0}
              href="/routine"
            />

            <StatCard
              type="reminders"
              icon={<BellIcon size={18} />}
              label="Reminders"
              value={stats.reminders || 0}
              meta={`${stats.upcoming_reminders || 0} upcoming`}
              href="/reminders"
            />
          </section>

          <section className={styles.dashboardMainGrid}>
            <div className={styles.dashboardPrimaryColumn}>
              <section className={styles.dashboardPanel}>
                <PanelHeader
                  title="Workspace overview"
                  description="A quick view of your current Memory workload."
                />

                <div className={styles.dashboardOverviewGrid}>
                  <OverviewMetric
                    label="Total items"
                    value={totalItems}
                    detail="Notes, tasks, lists and goals"
                  />

                  <OverviewMetric
                    label="Active work"
                    value={activeItems}
                    detail="Pending tasks, subtasks, list items and milestones"
                  />

                  <OverviewMetric
                    label="Today"
                    value={todayItems}
                    detail="Pending routines and reminders for today"
                  />

                  <OverviewMetric
                    label="Upcoming"
                    value={stats.upcoming_reminders || 0}
                    detail="Reminders needing attention"
                  />
                </div>
              </section>

              <section className={styles.dashboardPanel}>
                <PanelHeader
                  title="Upcoming reminders"
                  description="What needs your attention next."
                />

                <div className={styles.dashboardReminderList}>
                  {reminders.length > 0 ? (
                    reminders.map((reminder) => (
                      <ReminderItem key={reminder.id} reminder={reminder} />
                    ))
                  ) : (
                    <EmptyPanel text="No upcoming reminders." />
                  )}
                </div>
              </section>

              <section className={styles.dashboardPanel}>
                <PanelHeader
                  title="Completion"
                  description="Progress across your actionable Memory items."
                />

                <div className={styles.dashboardCompletionGrid}>
                  {completionSummary.map((item) => (
                    <CompletionCard key={item.label} item={item} />
                  ))}
                </div>
              </section>

              <section className={styles.dashboardPanel}>
                <PanelHeader
                  title="Your Memory"
                  description="Jump directly to a section."
                />

                <div className={styles.dashboardDistribution}>
                  <DistributionRow
                    label="Notes"
                    value={stats.notes || 0}
                    total={totalItems}
                    className="notes"
                  />

                  <DistributionRow
                    label="Tasks"
                    value={stats.tasks || 0}
                    total={totalItems}
                    className="tasks"
                  />

                  <DistributionRow
                    label="Lists"
                    value={stats.lists || 0}
                    total={totalItems}
                    className="lists"
                  />

                  <DistributionRow
                    label="Goals"
                    value={stats.goals || 0}
                    total={totalItems}
                    className="goals"
                  />

                  <DistributionRow
                    label="Routines"
                    value={stats.routines || 0}
                    total={totalItems}
                    className="routines"
                  />
                </div>
              </section>

              <section className={styles.dashboardPanel}>
                <PanelHeader
                  title="Recent activity"
                  description="Your most recently updated Memory items."
                />

                <div className={styles.dashboardActivityList}>
                  {recentItems.length > 0 ? (
                    recentItems.map((item) => (
                      <RecentItem key={`${item.type}-${item.id}`} item={item} />
                    ))
                  ) : (
                    <EmptyPanel text="Your recent memory activity will appear here." />
                  )}
                </div>
              </section>
            </div>

            <aside className={styles.dashboardSideColumn}>
              <section className={styles.dashboardPanel}>
                <PanelHeader
                  title="Today's routines"
                  description="Your routines scheduled for today."
                />

                <div className={styles.dashboardTodayRoutineList}>
                  {todayRoutines.length > 0 ? (
                    todayRoutines.map((routine) => (
                      <RoutineDashboardItem
                        key={routine.id}
                        routine={routine}
                        onStart={async (item) => {
                          await routines.handleStartToday(item);
                        }}
                        onComplete={async (item) => {
                          await routines.handleCompleteToday(item);
                        }}
                        onAddAmount={async (item) => {
                          await routines.handleAddAmount(item);
                        }}
                        onRemoveAmount={async (item) => {
                          await routines.handleRemoveAmount(item);
                        }}
                      />
                    ))
                  ) : (
                    <EmptyPanel text="No routines scheduled for today." />
                  )}
                </div>
              </section>

              <section className={styles.dashboardPanel}>
                <PanelHeader
                  title="Quick access"
                  description="Open the areas you use most."
                />

                <div className={styles.dashboardQuickGrid}>
                  <QuickLink
                    href="/notes"
                    icon={
                      <FileTextIcon
                        size={17}
                        className={styles.quickAccessNotesIcon}
                      />
                    }
                    label="Notes"
                  />

                  <QuickLink
                    href="/tasks"
                    icon={
                      <TasksIcon
                        size={17}
                        className={styles.quickAccessTasksIcon}
                      />
                    }
                    label="Tasks"
                  />

                  <QuickLink
                    href="/lists"
                    icon={
                      <ListsIcon
                        size={17}
                        className={styles.quickAccessListsIcon}
                      />
                    }
                    label="Lists"
                  />

                  <QuickLink
                    href="/goals"
                    icon={
                      <GoalIcon
                        size={17}
                        className={styles.quickAccessGoalsIcon}
                      />
                    }
                    label="Goals"
                  />

                  <QuickLink
                    href="/routine"
                    icon={
                      <RoutineIcon
                        size={17}
                        className={styles.quickAccessRoutinesIcon}
                      />
                    }
                    label="Routines"
                  />

                  <QuickLink
                    href="/tags"
                    icon={
                      <TagsIcon
                        size={17}
                        className={styles.quickAccessTagsIcon}
                      />
                    }
                    label="Tags"
                  />

                  <QuickLink
                    href="/archive"
                    icon={
                      <ArchiveIcon
                        size={17}
                        className={styles.quickAccessArchiveIcon}
                      />
                    }
                    label="Archive"
                  />

                  <QuickLink
                    href="/favorites"
                    icon={
                      <FavoriteIcon
                        size={17}
                        className={styles.quickAccessFavoritesIcon}
                      />
                    }
                    label="Favorites"
                  />
                </div>
              </section>
            </aside>
          </section>
        </>
      )}
      {createType === "note" && (
        <NotesCreate
          open={notes.noteModalOpen}
          onClose={() => {
            setCreateType(null);
            notes.handleCloseNoteModal();
          }}
          onCreate={async (note) => {
            await notes.handleCreate(note);
            await loadDashboard();
          }}
          onUpdate={notes.handleUpdate}
          editNote={notes.editNote}
        />
      )}
      {createType === "task" && (
        <TasksCreate
          open={tasks.taskModalOpen}
          onClose={() => {
            setCreateType(null);
            tasks.handleCloseTaskModal();
          }}
          onCreate={async (task) => {
            await tasks.handleCreate(task);
            await loadDashboard();
          }}
          onUpdate={tasks.handleUpdate}
          editTask={tasks.editTask}
        />
      )}
      {createType === "list" && (
        <ListsCreate
          open={lists.listModalOpen}
          onClose={() => {
            setCreateType(null);
            lists.handleCloseListModal();
          }}
          onCreate={async (list) => {
            await lists.handleCreate(list);
            await loadDashboard();
          }}
          onUpdate={lists.handleUpdate}
          editList={lists.editList}
        />
      )}
      {createType === "goal" && (
        <GoalsCreate
          open={goals.goalModalOpen}
          onClose={() => {
            setCreateType(null);
            goals.handleCloseGoalModal();
          }}
          onCreate={async (goal) => {
            await goals.handleCreate(goal);
            await loadDashboard();
          }}
          onUpdate={goals.handleUpdate}
          editGoal={goals.editGoal}
        />
      )}
      {createType === "routine" && (
        <RoutineCreate
          open={routines.routineModalOpen}
          key={
            routines.editRoutine ? "edit-" + routines.editRoutine.id : "create"
          }
          editRoutine={routines.editRoutine}
          onClose={() => {
            setCreateType(null);
            routines.handleCloseRoutineModal();
          }}
          onCreate={async (routine) => {
            await routines.handleCreate(routine);
            await loadDashboard();
          }}
          onUpdate={routines.handleUpdate}
        />
      )}
    </main>
  );
}

function PanelHeader({ title, description }) {
  return (
    <div className={styles.dashboardPanelHeader}>
      <div>
        <Typography as="h2" variant="h4" size="md" weight="semibold">
          {title}
        </Typography>

        <Typography as="p" variant="caption" size="xs" color="secondary">
          {description}
        </Typography>
      </div>
    </div>
  );
}

function StatCard({ type, icon, label, value, meta, href }) {
  return (
    <button
      type="button"
      className={[
        styles.dashboardStatCard,
        styles[`dashboardStatCard--${type}`],
      ].join(" ")}
      onClick={() => {
        window.location.href = href;
      }}
    >
      <span className={styles.dashboardStatIcon}>{icon}</span>

      <span className={styles.dashboardStatContent}>
        <span className={styles.dashboardStatLabel}>{label}</span>

        <span className={styles.dashboardStatValue}>{value}</span>

        {meta && <span className={styles.dashboardStatMeta}>{meta}</span>}
      </span>
    </button>
  );
}

function OverviewMetric({ label, value, detail }) {
  return (
    <div className={styles.dashboardOverviewMetric}>
      <span className={styles.dashboardOverviewLabel}>{label}</span>

      <strong className={styles.dashboardOverviewValue}>{value}</strong>

      <span className={styles.dashboardOverviewDetail}>{detail}</span>
    </div>
  );
}

function CompletionCard({ item }) {
  return (
    <div
      className={[
        styles.dashboardCompletionCard,
        styles[`dashboardCompletionCard--${item.className}`],
      ].join(" ")}
    >
      <div className={styles.dashboardCompletionTop}>
        <span className={styles.dashboardCompletionLabel}>{item.label}</span>

        <strong>{item.value}%</strong>
      </div>

      <div className={styles.dashboardProgressTrack}>
        <div
          className={styles.dashboardProgressBar}
          style={{
            width: `${item.value}%`,
          }}
        />
      </div>

      <div className={styles.dashboardProgressMeta}>
        <span>{item.completed} completed</span>

        <span>{item.total} total</span>
      </div>
    </div>
  );
}

function DistributionRow({ label, value, total, className }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={styles.dashboardDistributionRow}>
      <div className={styles.dashboardDistributionHeader}>
        <span>{label}</span>

        <span>{value}</span>
      </div>

      <div className={styles.dashboardDistributionTrack}>
        <div
          className={[
            styles.dashboardDistributionBar,
            styles[`dashboardDistributionBar--${className}`],
          ].join(" ")}
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}

function RecentItem({ item }) {
  const config = TYPE_CONFIG[item?.type] || TYPE_CONFIG.note;

  const Icon = config.icon;

  return (
    <button
      type="button"
      className={[
        styles.dashboardActivityItem,
        styles[`dashboardActivityItem--${config.className}`],
      ].join(" ")}
    >
      <span
        className={[
          styles.dashboardActivityIcon,
          styles[`dashboardActivityIcon--${config.className}`],
        ].join(" ")}
      >
        <Icon size={16} />
      </span>

      <span className={styles.dashboardActivityContent}>
        <span className={styles.dashboardActivityTop}>
          <span className={styles.dashboardActivityTitle}>
            {item?.title || "Memory"}
          </span>

          <span className={styles.dashboardActivityType}>{config.label}</span>
        </span>

        <span className={styles.dashboardActivityDate}>
          {item?.updated_at_label || "Recently updated"}
        </span>
      </span>

      {item?.locked && (
        <LockIcon size={14} className={styles.dashboardActivityLock} />
      )}
    </button>
  );
}

function RoutineDashboardItem({
  routine,
  onStart,
  onComplete,
  onAddAmount,
  onRemoveAmount,
}) {
  const occurrence = routine?.occurrence || {};

  const isTarget = routine?.completion_type === "target";
  const hasDuration = !isTarget && Number(routine?.duration_minutes) > 0;

  const isStarted = Boolean(occurrence?.started_at);

  const isCompleted =
    occurrence?.status === "completed" ||
    occurrence?.status === "late" ||
    Boolean(occurrence?.completed_at);

  const status = occurrence?.status || "pending";

  const current = Number(
    occurrence?.current_value ?? routine?.current_value ?? 0,
  );

  const target = Number(occurrence?.target_value ?? routine?.target_value ?? 0);

  const durationMinutes = Number(routine?.duration_minutes || 0);

  const durationSeconds = durationMinutes * 60;

  const [timerNow, setTimerNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isStarted || !occurrence?.started_at || isCompleted) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimerNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isStarted, isCompleted, occurrence?.started_at]);

  const startedTimestamp = occurrence?.started_at
    ? new Date(occurrence.started_at).getTime()
    : null;

  const completedTimestamp = occurrence?.completed_at
    ? new Date(occurrence.completed_at).getTime()
    : null;

  const actualDurationSeconds =
    occurrence?.actual_duration_seconds != null
      ? Number(occurrence.actual_duration_seconds)
      : isCompleted && startedTimestamp && completedTimestamp
        ? Math.max(
            0,
            Math.floor((completedTimestamp - startedTimestamp) / 1000),
          )
        : null;

  const elapsedSeconds =
    isStarted && startedTimestamp
      ? Math.max(0, Math.floor((timerNow - startedTimestamp) / 1000))
      : 0;

  const progress = isTarget
    ? target > 0
      ? Math.min(100, Math.round((current / target) * 100))
      : isCompleted
        ? 100
        : 0
    : isCompleted
      ? 100
      : hasDuration && isStarted && durationSeconds > 0
        ? Math.min(100, Math.round((elapsedSeconds / durationSeconds) * 100))
        : 0;

  const scheduleLabel =
    routine?.schedule_label || occurrence?.scheduled_time || "Today";

  const statusLabel =
    routine?.status_label ||
    {
      pending: "Pending",
      completed: "Completed",
      late: "Late",
      missed: "Missed",
      skipped: "Skipped",
    }[status] ||
    "Pending";

  function formatTimer(seconds) {
    const value = Math.max(0, Number(seconds) || 0);

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const remaining = value % 60;

    if (hours > 0) {
      return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(remaining).padStart(2, "0")
      );
    }

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(remaining).padStart(2, "0")
    );
  }

  function formatActualDuration(seconds) {
    return formatTimer(seconds);
  }

  const lateDuration =
    routine?.late_duration_label ||
    formatRoutineLateDuration(occurrence?.late_by_minutes);

  function formatScheduledTime(value) {
    if (!value) {
      return "";
    }

    const match = String(value).match(/^(\d{1,2}):(\d{2})/);

    if (!match) {
      return value;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) {
      return value;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div
      className={[
        styles.dashboardTodayRoutine,
        routine?.locked ? styles.dashboardTodayRoutineLocked : "",
      ].join(" ")}
    >
      <div className={styles.dashboardTodayRoutineMain}>
        <span className={styles.dashboardTodayRoutineIcon}>
          <RoutineIconMap name={routine?.icon || "check"} size={28} />
        </span>

        <div className={styles.dashboardTodayRoutineContent}>
          <div className={styles.dashboardTodayRoutineTop}>
            <span className={styles.dashboardTodayRoutineTitle}>
              {routine?.title || "Routine"}
            </span>

            <span className={styles.dashboardTodayRoutineSchedule}>
              {formatScheduledTime(scheduleLabel)}
            </span>
          </div>

          {isTarget ? (
            <>
              <span className={styles.dashboardTodayRoutineValue}>
                {formatRoutineValue(current)} / {formatRoutineValue(target)}
                {routine?.unit ? ` ${routine.unit}` : ""}
              </span>

              <span className={styles.dashboardTodayRoutineProgress}>
                <span
                  className={styles.dashboardTodayRoutineProgressBar}
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </span>
            </>
          ) : (
            <div className={styles.dashboardTodayRoutineStatusContent}>
              <span
                className={`${styles.dashboardTodayRoutineStatus} ${
                  status === "completed"
                    ? styles.dashboardTodayRoutineStatusCompleted
                    : status === "late"
                      ? styles.dashboardTodayRoutineStatusLate
                      : status === "missed"
                        ? styles.dashboardTodayRoutineStatusMissed
                        : status === "skipped"
                          ? styles.dashboardTodayRoutineStatusSkipped
                          : ""
                }`}
              >
                {isCompleted
                  ? "Completed"
                  : hasDuration && isStarted
                    ? "In Progress"
                    : statusLabel}
              </span>

              {isCompleted && hasDuration && actualDurationSeconds != null && (
                <span className={styles.dashboardTodayRoutineTimer}>
                  (Actual: {formatActualDuration(actualDurationSeconds)})
                </span>
              )}

              {hasDuration && isStarted && !isCompleted && (
                <span className={styles.dashboardTodayRoutineTimer}>
                  {formatTimer(elapsedSeconds)} / {formatTimer(durationSeconds)}
                </span>
              )}
            </div>
          )}

          {status === "late" && lateDuration && (
            <span className={styles.dashboardTodayRoutineLate}>
              Late by {lateDuration}
            </span>
          )}
        </div>
      </div>

      {!routine?.locked && (
        <div className={styles.dashboardTodayRoutineActions}>
          {isTarget ? (
            <>
              <Button
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddAmount?.(routine);
                }}
              >
                Add
              </Button>

              <Button
                size="sm"
                variant="outline"
                className={styles.routineRemoveAmountButton}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveAmount?.(routine);
                }}
              >
                Remove
              </Button>
            </>
          ) : hasDuration ? (
            <>
              {!isStarted && !isCompleted ? (
                <>
                  <Button
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onStart?.(routine);
                    }}
                  >
                    Start
                  </Button>

                  <Button size="sm" variant="outline" disabled>
                    Mark Done
                  </Button>
                </>
              ) : isStarted && !isCompleted ? (
                <Button
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onComplete?.(routine);
                  }}
                >
                  Mark Done
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  Completed Today
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              variant={isCompleted ? "outline" : "primary"}
              disabled={isCompleted}
              onClick={(event) => {
                event.stopPropagation();

                if (!isCompleted) {
                  onComplete?.(routine);
                }
              }}
            >
              {isCompleted ? "Completed Today" : "Mark Today"}
            </Button>
          )}
        </div>
      )}
      {routine?.locked && (
        <span className={styles.dashboardTodayRoutineLock}>
          <LockIcon size={14} />
        </span>
      )}
    </div>
  );
}

function formatRoutineValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  if (Number.isInteger(number)) {
    return String(number);
  }

  return String(Number(number.toFixed(2)));
}

function formatRoutineLateDuration(minutes) {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function ReminderItem({ reminder }) {
  const config = TYPE_CONFIG[reminder?.type] || {
    label: reminder?.type_label || "Reminder",
    icon: BellIcon,
    className: "reminders",
  };

  const Icon = config.icon;

  return (
    <button type="button" className={styles.dashboardReminderItem}>
      <span
        className={[
          styles.dashboardReminderIcon,
          styles[`dashboardReminderIcon--${config.className}`],
        ].join(" ")}
      >
        {" "}
        <Icon size={15} />{" "}
      </span>

      <span className={styles.dashboardReminderContent}>
        <span className={styles.dashboardReminderTop}>
          <span className={styles.dashboardReminderTitle}>
            {reminder?.title || "Reminder"}
          </span>

          <span
            className={[
              styles.dashboardReminderType,
              styles[`dashboardReminderType--${config.className}`],
            ].join(" ")}
          >
            {reminder?.type_label || config.label}
          </span>
        </span>

        <span className={styles.dashboardReminderDate}>
          {reminder?.reminder_at_label || "Upcoming"}
        </span>
      </span>
    </button>
  );
}

function EmptyDashboard({ onCreate, createItems }) {
  return (
    <div className={styles.dashboardEmptyState}>
      <section className={styles.dashboardEmptyHero}>
        <Image
          src="/images/dashboard/dashboardEmptyIllustration.png"
          alt="Create your first item"
          width={180}
          height={180}
          className={styles.dashboardEmptyIllustration}
        />

        <Typography
          as="h2"
          variant="h3"
          size="2xl"
          weight="bold"
          className={styles.dashboardEmptyTitle}
        >
          Your workspace is empty
        </Typography>

        <Typography
          as="p"
          variant="bodySmall"
          size="sm"
          color="secondary"
          className={styles.dashboardEmptyDescription}
        >
          Add notes, tasks, lists, goals or routines to start building your
          organized space.
        </Typography>

        <span
          className={styles.dashboardEmptyCreate}
          onClick={onCreate}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onCreate();
            }
          }}
        >
          <PlusIcon size={18} />
          <span>Create your first item</span>
        </span>

        <Typography
          as="p"
          variant="caption"
          size="xs"
          color="secondary"
          className={styles.dashboardEmptyQuote}
        >
          “Small step today. Big process tomarrow.”
        </Typography>
      </section>

      <section className={styles.dashboardEmptyQuickPanel}>
        <PanelHeader
          title="Quick access"
          description="Open the areas you use most."
        />

        <div className={styles.dashboardEmptyQuickGrid}>
          <QuickLink
            href="/notes"
            icon={
              <FileTextIcon size={19} className={styles.quickAccessNotesIcon} />
            }
            label="Notes"
          />

          <QuickLink
            href="/tasks"
            icon={
              <TasksIcon size={19} className={styles.quickAccessTasksIcon} />
            }
            label="Tasks"
          />

          <QuickLink
            href="/lists"
            icon={
              <ListsIcon size={19} className={styles.quickAccessListsIcon} />
            }
            label="Lists"
          />

          <QuickLink
            href="/goals"
            icon={
              <GoalIcon size={19} className={styles.quickAccessGoalsIcon} />
            }
            label="Goals"
          />

          <QuickLink
            href="/routine"
            icon={
              <RoutineIcon
                size={19}
                className={styles.quickAccessRoutinesIcon}
              />
            }
            label="Routines"
          />

          <QuickLink
            href="/tags"
            icon={<TagsIcon size={19} className={styles.quickAccessTagsIcon} />}
            label="Tags"
          />

          <QuickLink
            href="/archive"
            icon={
              <ArchiveIcon
                size={19}
                className={styles.quickAccessArchiveIcon}
              />
            }
            label="Archive"
          />

          <QuickLink
            href="/favorites"
            icon={
              <FavoriteIcon
                size={19}
                className={styles.quickAccessFavoritesIcon}
              />
            }
            label="Favorites"
          />
        </div>
      </section>
    </div>
  );
}

function QuickLink({ href, icon, label }) {
  return (
    <button
      type="button"
      className={styles.dashboardQuickLink}
      onClick={() => {
        window.location.href = href;
      }}
    >
      <span className={styles.dashboardQuickIcon}>{icon}</span>

      <span>{label}</span>
    </button>
  );
}

function EmptyPanel({ text }) {
  return (
    <div className={styles.dashboardEmpty}>
      <Typography as="p" variant="bodySmall" size="sm" color="secondary">
        {text}
      </Typography>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className={styles.dashboardPage}>
      <header className={styles.dashboardHeader}>
        <div className={styles.dashboardHeading}>
          <div className={styles.dashboardHeadingRow}>
            <span className={styles.dashboardHeadingIcon}>
              <HomeIcon size={19} />
            </span>

            <Typography as="h1" variant="h2" size="lg" weight="semibold">
              Dashboard
            </Typography>
          </div>

          <Typography as="p" variant="bodySmall" size="sm" color="secondary">
            Stay organized and get things done.
          </Typography>
        </div>

        <div className={styles.dashboardActions}>
          <Button
            size="md"
            type="button"
            className={styles.dashboardCreateButton}
            startIcon={<PlusIcon size={26} />}
            aria-label="Create"
            disabled
          />
        </div>
      </header>

      <div className={styles.dashboardLoadingBox}>
        <div className={styles.dashboardLoadingSpinner} aria-label="Loading" />
      </div>

      <section className={styles.dashboardLoadingQuickPanel}>
        <div className={styles.dashboardLoadingQuickHeader}>
          <div className={styles.dashboardLoadingQuickTitle} />
          <div className={styles.dashboardLoadingQuickDescription} />
        </div>

        <div className={styles.dashboardLoadingQuickGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={styles.dashboardLoadingQuickLink}>
              <div className={styles.dashboardLoadingQuickIcon} />
              <div className={styles.dashboardLoadingQuickText} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : 0;
}

function clampPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(number)));
}

function getCompletionPercent(completed, total) {
  const totalNumber = toNumber(total);

  if (!totalNumber) {
    return 0;
  }

  return clampPercent((toNumber(completed) / totalNumber) * 100);
}
