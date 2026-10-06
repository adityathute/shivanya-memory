"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArchiveIcon,
  NotesIcon,
  TasksIcon,
  ListsIcon,
  RestoreIcon,
  ConfirmDialog,
  LockIcon,
  GoalIcon,
  DeleteIcon,
  RoutineIcon,
} from "shivanya-ui";

import { apiClient, API_ENDPOINTS } from "@/lib/auth";

import MemoryCollection from "../../../components/MemoryCollection/MemoryCollection";

import MemoryPinModal from "../../../components/MemoryPinModal/MemoryPinModal";

import "./Archive.css";

const typeConfig = {
  note: {
    label: "Note",
    icon: NotesIcon,
    color: "#D97706",
  },

  task: {
    label: "Task",
    icon: TasksIcon,
    color: "#16A34A",
  },

  list: {
    label: "List",
    icon: ListsIcon,
    color: "#7C3AED",
  },

  goal: {
    label: "Goal",
    icon: GoalIcon,
    color: "#2563EB",
  },

  routine: {
    label: "Routine",
    icon: RoutineIcon,
    color: "#0891B2",
  },
};

const archiveFilters = [
  {
    value: "all",
    label: "All",
  },

  {
    value: "note",
    label: "Notes",
  },

  {
    value: "task",
    label: "Tasks",
  },

  {
    value: "list",
    label: "Lists",
  },

  {
    value: "goal",
    label: "Goals",
  },

  {
    value: "routines",
    label: "Routines",
  },
];

export default function Archive() {
  const [archiveItems, setArchiveItems] = useState([]);

  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [restoreItem, setRestoreItem] = useState(null);

  const [deleteItem, setDeleteItem] = useState(null);

  const [restorePinOpen, setRestorePinOpen] = useState(false);

  const [deletePinOpen, setDeletePinOpen] = useState(false);

  const itemsPerPage = 10;

  /* ==========================================================
       Load Archive
       ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadArchive = async () => {
      try {
        const response = await apiClient(API_ENDPOINTS.MEMORY.ARCHIVE, {
          method: "GET",
        });

        if (cancelled) {
          return;
        }

        const items = Array.isArray(response)
          ? response
          : response?.results || [];

        setArchiveItems(items);
        setError("");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(requestError?.message || "Unable to load archive.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadArchive();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasArchiveItems = archiveItems.length > 0;

  /* ==========================================================
       Filter + Search
       ========================================================== */

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return archiveItems.filter((item) => {
      const type = (item.type || "note").toLowerCase();

      let matchesFilter = true;

      if (
        activeFilter === "note" ||
        activeFilter === "task" ||
        activeFilter === "memorylist" ||
        activeFilter === "goal"
      ) {
        matchesFilter = type === activeFilter;
      }

      const matchesSearch =
        !normalizedSearch ||
        item.title?.toLowerCase().includes(normalizedSearch) ||
        item.content?.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [archiveItems, activeFilter, search]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ==========================================================
       Date
       ========================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* ==========================================================
       Restore
       ========================================================== */

  const handleRestore = async (item) => {
    try {
      await apiClient(
        API_ENDPOINTS.MEMORY.ARCHIVE_RESTORE(item.id) + `?type=${item.type}`,
        {
          method: "POST",
        },
      );

      setArchiveItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id),
      );

      setRestoreItem(null);
    } catch (requestError) {
      setError(requestError?.message || "Unable to restore item.");
    }
  };

  /* ==========================================================
       Delete
       ========================================================== */
  const handleDelete = async (item) => {
    try {
      const type = (item.type || item.content_type || "note").toLowerCase();

      await apiClient(API_ENDPOINTS.MEMORY.TRASH, {
        method: "POST",

        body: JSON.stringify({
          object_id: item.id,
          content_type: type,
        }),
      });

      setArchiveItems((currentItems) =>
        currentItems.filter(
          (currentItem) =>
            !(
              currentItem.id === item.id &&
              (
                currentItem.type ||
                currentItem.content_type ||
                "note"
              ).toLowerCase() === type
            ),
        ),
      );

      setDeleteItem(null);
    } catch (requestError) {
      setError(requestError?.message || "Unable to move item to Trash.");
    }
  };

  /* ==========================================================
       Archive Item
       ========================================================== */

  const renderArchiveItem = (item) => {
    const type = (item.type || "note").toLowerCase();

    const config = typeConfig[type] || typeConfig.note;

    const ItemIcon = config.icon;

    return (
      <article
        key={`${type}-${item.id}`}
        className="memoryCollection__item archiveItem"
      >
        <div
          className="memoryCollection__itemIcon archiveItem__icon"
          style={{
            color: config.color,
            background: `${config.color}10`,
          }}
        >
          <ItemIcon size={18} />
        </div>

        <div className="memoryCollection__itemInfo">
          <div className="memoryCollection__itemTop">
            <h3>{item.title}</h3>

            <span
              className="memoryCollection__itemType"
              style={{
                color: config.color,
              }}
            >
              {config.label}
            </span>
          </div>

          {item.locked ? (
            <p className="memoryCollection__itemLocked">
              <LockIcon size={13} />

              <span>Note is locked</span>
            </p>
          ) : item.content ? (
            <p>{item.content}</p>
          ) : null}

          {item.archived_at && (
            <span className="memoryCollection__itemDate">
              Archived {formatDate(item.archived_at)}
            </span>
          )}
        </div>

        <div className="memoryCollection__itemActions archiveItem__actions">
          <button
            type="button"
            className="archiveItem__restore"
            onClick={() => {
              if (item.locked) {
                setRestoreItem(item);
                setRestorePinOpen(true);

                return;
              }

              setRestoreItem(item);
            }}
          >
            <RestoreIcon size={17} />

            <span>Restore</span>
          </button>
          <button
            type="button"
            className="archiveItem__delete"
            onClick={() => {
              if (item.locked) {
                setDeleteItem(item);
                setDeletePinOpen(true);

                return;
              }

              setDeleteItem(item);
            }}
            aria-label="Move to Trash"
          >
            <DeleteIcon size={16} />
          </button>
        </div>
      </article>
    );
  };

  return (
    <>
      <MemoryCollection
        title="Archive"
        count={archiveItems.length}
        search={hasArchiveItems ? search : undefined}
        setSearch={
          hasArchiveItems
            ? (value) => {
                setSearch(value);
                setCurrentPage(1);
              }
            : undefined
        }
        searchPlaceholder="Search archive..."
        searchAriaLabel="Search archive"
        filters={hasArchiveItems ? archiveFilters : []}
        activeFilter={hasArchiveItems ? activeFilter : "all"}
        setActiveFilter={
          hasArchiveItems
            ? (value) => {
                setActiveFilter(value);
                setCurrentPage(1);
              }
            : undefined
        }
        loading={loading}
        showToolbarSkeleton={loading}
        items={filteredItems}
        paginatedItems={paginatedItems}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        renderItem={renderArchiveItem}
        contentTitle="Archived items"
        emptyIcon={
          <span className="archivePage__emptyIcon">
            <ArchiveIcon size={32} />
          </span>
        }
        emptyTitle={
          search.trim()
            ? `No matching ${activeFilter === "all" ? "items" : `${activeFilter}s`}`
            : activeFilter !== "all"
              ? `No archived ${activeFilter}s`
              : "Your archive is empty"
        }
        emptyDescription={
          search.trim()
            ? activeFilter !== "all"
              ? `No archived ${activeFilter}s match your search.`
              : "Try a different search term."
            : activeFilter !== "all"
              ? `Archived ${activeFilter}s will appear here.`
              : "Archived notes, tasks, lists and goals will appear here."
        }
        pageClassName="archivePage"
        emptyClassName="archivePage__empty"
      />

      {error && <div className="archivePage__error">{error}</div>}

      {/* PIN */}

      <MemoryPinModal
        open={restorePinOpen}
        onClose={() => {
          setRestorePinOpen(false);
          setRestoreItem(null);
        }}
        onSuccess={() => {
          setRestorePinOpen(false);
        }}
        title="Unlock Note"
        action="Restore"
      />

      <MemoryPinModal
        open={deletePinOpen}
        onClose={() => {
          setDeletePinOpen(false);
          setDeleteItem(null);
        }}
        onSuccess={() => {
          setDeletePinOpen(false);
        }}
        title="Unlock Note"
        action="Delete"
      />

      {/* Confirmation */}

      <ConfirmDialog
        open={Boolean(restoreItem) && !restorePinOpen}
        title="Restore item"
        message={restoreItem ? `Are you sure you want to restore?` : ""}
        confirmText="Restore"
        cancelText="Cancel"
        variant="success"
        size="md"
        onCancel={() => {
          setRestoreItem(null);
        }}
        onConfirm={async () => {
          if (!restoreItem) {
            return;
          }

          await handleRestore(restoreItem);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteItem) && !deletePinOpen}
        title="Move to Trash"
        message={
          deleteItem
            ? "Are you sure you want to move this item to the Trash?"
            : ""
        }
        confirmText="Move to Trash"
        cancelText="Cancel"
        variant="danger"
        size="md"
        onCancel={() => {
          setDeleteItem(null);
        }}
        onConfirm={async () => {
          if (!deleteItem) {
            return;
          }

          await handleDelete(deleteItem);
        }}
      />
    </>
  );
}
