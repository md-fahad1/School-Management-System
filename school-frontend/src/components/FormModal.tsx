"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";

const FormLoading = () => (
  <div className="flex items-center justify-center gap-3 py-16 text-sm text-textSecondary">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
    Loading form...
  </div>
);
// USE LAZY LOADING
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <FormLoading />,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <FormLoading />,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <FormLoading />,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <FormLoading />,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <FormLoading />,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <FormLoading />,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <FormLoading />,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <FormLoading />,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <FormLoading />,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <FormLoading />,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <FormLoading />,
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => <FormLoading />,
});
const BookForm = dynamic(() => import("./forms/BookForm"), {
  loading: () => <FormLoading />,
});
const FeeStructureForm = dynamic(() => import("./forms/FeeStructureForm"), {
  loading: () => <FormLoading />,
});
const GradeForm = dynamic(() => import("./forms/GradeForm"), {
  loading: () => <FormLoading />,
});
const VehicleForm = dynamic(() => import("./forms/VehicleForm"), {
  loading: () => <FormLoading />,
});

const forms: {
  [key: string]: (type: "create" | "update", data: any, onSuccess: () => void) => JSX.Element;
} = {
  teacher: (type, data, onSuccess) => <TeacherForm type={type} data={data} onSuccess={onSuccess} />,
  student: (type, data, onSuccess) => <StudentForm type={type} data={data} onSuccess={onSuccess} />,
  subject: (type, data, onSuccess) => <SubjectForm type={type} data={data} onSuccess={onSuccess} />,
  class: (type, data, onSuccess) => <ClassForm type={type} data={data} onSuccess={onSuccess} />,
  parent: (type, data, onSuccess) => <ParentForm type={type} data={data} onSuccess={onSuccess} />,
  lesson: (type, data, onSuccess) => <LessonForm type={type} data={data} onSuccess={onSuccess} />,
  event: (type, data, onSuccess) => <EventForm type={type} data={data} onSuccess={onSuccess} />,
  announcement: (type, data, onSuccess) => <AnnouncementForm type={type} data={data} onSuccess={onSuccess} />,
  exam: (type, data, onSuccess) => <ExamForm type={type} data={data} onSuccess={onSuccess} />,
  assignment: (type, data, onSuccess) => <AssignmentForm type={type} data={data} onSuccess={onSuccess} />,
  result: (type, data, onSuccess) => <ResultForm type={type} data={data} onSuccess={onSuccess} />,
  attendance: (type, data, onSuccess) => <AttendanceForm type={type} data={data} onSuccess={onSuccess} />,
  book: (type, data, onSuccess) => <BookForm type={type} data={data} onSuccess={onSuccess} />,
  feeStructure: (type, data, onSuccess) => <FeeStructureForm type={type} data={data} onSuccess={onSuccess} />,
    grade: (type, data, onSuccess) => <GradeForm type={type} data={data} onSuccess={onSuccess} />,
      vehicle: (type, data, onSuccess) => <VehicleForm type={type} data={data} onSuccess={onSuccess} />,
};
// One remove mutation per table, all following the same
// `remove<Entity>(id: ID!): Boolean` shape the backend already exposes.
// Add a line here as each module gets wired up — that's the only
// change needed to make delete work for a new table.
const REMOVE_MUTATIONS: { [key: string]: string } = {
  subject: `mutation($id: ID!) { removeSubject(id: $id) }`,
  teacher: `mutation($id: ID!) { removeTeacher(id: $id) }`,
  student: `mutation($id: ID!) { removeStudent(id: $id) }`,
  class: `mutation($id: ID!) { removeClass(id: $id) }`,
  parent: `mutation($id: ID!) { removeParent(id: $id) }`,
  lesson: `mutation($id: ID!) { removeLesson(id: $id) }`,
  event: `mutation($id: ID!) { removeEvent(id: $id) }`,
  announcement: `mutation($id: ID!) { removeAnnouncement(id: $id) }`,
  exam: `mutation($id: ID!) { removeExam(id: $id) }`,
  assignment: `mutation($id: ID!) { removeAssignment(id: $id) }`,
  result: `mutation($id: ID!) { removeResult(id: $id) }`,
  attendance: `mutation($id: ID!) { removeAttendance(id: $id) }`,
  book: `mutation($id: ID!) { removeBook(id: $id) }`,
  feeStructure: `mutation($id: ID!) { removeFeeStructure(id: $id) }`,
    grade: `mutation($id: ID!) { removeGrade(id: $id) }`,
      vehicle: `mutation($id: ID!) { removeVehicle(id: $id) }`,
};

// One icon + color per action, used for the trigger button instead of
// the old /create.png, /update.png, /delete.png images.
const actionMeta = {
  create: { Icon: Plus, bg: "bg-accent", iconColor: "text-white" },
  update: { Icon: Pencil, bg: "bg-infoLight", iconColor: "text-info" },
  delete: { Icon: Trash2, bg: "bg-dangerLight", iconColor: "text-danger" },
} as const;

const FormModal = ({
  table,
  type,
  data,
  id,
}: {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "book"
    | "feeStructure"
    | "grade"
    | "vehicle";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
}) => {
  const router = useRouter();
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const iconSize = type === "create" ? 16 : 14;
  const { Icon, bg, iconColor } = actionMeta[type];
  const isDelete = type === "delete";
  // "feeStructure" -> "fee structure" for friendlier copy
  const tableLabel = table.replace(/([A-Z])/g, " $1").toLowerCase();

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Esc closes the modal and the page behind it stops scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError("");

    const mutation = REMOVE_MUTATIONS[table];
    if (!mutation || !id) {
      setDeleteError(`Delete isn't wired up for "${table}" yet.`);
      return;
    }

    setDeleting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(mutation, { id });
      setOpen(false);
      // List pages are Server Components that fetch on each request —
      // this re-runs that fetch so the deleted row disappears without
      // a full page reload.
      router.refresh();
    } catch (err: any) {
      setDeleteError(
        err?.response?.errors?.[0]?.message ?? "Failed to delete. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (type === "delete" && id) {
      return (
        <form onSubmit={handleDelete} className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dangerLight text-danger">
            <Trash2 size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-textPrimary capitalize">
              Delete {tableLabel}?
            </h2>
            <p className="mt-1 text-sm text-textSecondary">
              This can&apos;t be undone. All data linked to this {tableLabel} will be
              permanently removed.
            </p>
          </div>
          {deleteError && (
            <p className="w-full rounded-lg bg-dangerLight px-3 py-2 text-sm text-danger">
              {deleteError}
            </p>
          )}
          <div className="mt-2 flex w-full gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-textPrimary transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-danger py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Trash2 size={16} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      );
    }

    if (type === "create" || type === "update") {
      return forms[table]
        ? forms[table](type, data, () => {
            setOpen(false);
            router.refresh();
          })
        : "Form not found!";
    }

    return "Form not found!";
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bg} ${iconColor} hover:opacity-80 transition`}
        onClick={() => setOpen(true)}
        title={type}
      >
        <Icon size={iconSize} />
      </button>
      {open && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          // Close on backdrop click, but not when a text selection drag
          // started inside the card ends outside it.
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className={`modal-card relative w-full ${
              isDelete ? "max-w-sm" : "modal-form max-w-2xl"
            } max-h-[90vh] overflow-y-auto rounded-2xl bg-cardBg p-6 shadow-2xl sm:p-8`}
          >
            {renderContent()}
            <button
              type="button"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-textMuted transition-colors hover:bg-gray-100 hover:text-textPrimary"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;