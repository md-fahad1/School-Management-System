"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { getErrorMessage } from "@/lib/errors";
import Modal from "./ui/Modal";
import { useToast } from "./ui/ToastProvider";

// Form ta load hote hote ekta chhoto grey box dekhabe ("Loading..." text er bodole).
const loading = () => <div className="animate-pulse h-40 bg-bg rounded-xl" />;

// USE LAZY LOADING
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), { loading });
const StudentForm = dynamic(() => import("./forms/StudentForm"), { loading });
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), { loading });
const ClassForm = dynamic(() => import("./forms/ClassForm"), { loading });
const ParentForm = dynamic(() => import("./forms/ParentForm"), { loading });
const LessonForm = dynamic(() => import("./forms/LessonForm"), { loading });
const EventForm = dynamic(() => import("./forms/EventForm"), { loading });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading });
const ExamForm = dynamic(() => import("./forms/ExamForm"), { loading });
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), { loading });
const ResultForm = dynamic(() => import("./forms/ResultForm"), { loading });
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), { loading });
const BookForm = dynamic(() => import("./forms/BookForm"), { loading });
const FeeStructureForm = dynamic(() => import("./forms/FeeStructureForm"), { loading });
const GradeForm = dynamic(() => import("./forms/GradeForm"), { loading });
const VehicleForm = dynamic(() => import("./forms/VehicleForm"), { loading });

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

// Button, title ar message e je nam dekhabe (camelCase table name er bodole).
const entityLabel: { [key: string]: string } = {
  feeStructure: "fee structure",
  attendance: "attendance record",
};
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const FormModal = ({
  table,
  type,
  data,
  id,
  itemName,
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
  /** Optional: delete popup e nam dekhabe, jemon "Rahim Uddin". */
  itemName?: string;
}) => {
  const router = useRouter();
  const toast = useToast();
  const label = entityLabel[table] ?? table;

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const close = useCallback(() => {
    setOpen(false);
    setDeleteError("");
  }, []);

  const handleDelete = async () => {
    setDeleteError("");

    const mutation = REMOVE_MUTATIONS[table];
    if (!mutation || !id) {
      setDeleteError(`Deleting a ${label} isn't available yet.`);
      return;
    }

    setDeleting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(mutation, { id });
      close();
      toast.success(`${cap(label)} deleted.`);
      // List page Server Component, tai refresh korle deleted row chole jay.
      router.refresh();
    } catch (err) {
      setDeleteError(getErrorMessage(err, `Couldn't delete this ${label}. Please try again.`));
    } finally {
      setDeleting(false);
    }
  };

  const onFormSuccess = () => {
    close();
    toast.success(type === "create" ? `${cap(label)} added successfully.` : `${cap(label)} updated.`);
    router.refresh();
  };

  return (
    <>
      {/* ---------- Je button ta page e dekha jay ---------- */}
      {type === "create" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 whitespace-nowrap"
        >
          <Plus size={16} />
          Add {cap(label)}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={`${type === "update" ? "Edit" : "Delete"} ${label}`}
          aria-label={`${type === "update" ? "Edit" : "Delete"} ${label}`}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
            type === "update"
              ? "bg-infoLight text-info hover:bg-info hover:text-white"
              : "bg-dangerLight text-danger hover:bg-danger hover:text-white"
          }`}
        >
          {type === "update" ? <Pencil size={14} /> : <Trash2 size={14} />}
        </button>
      )}

      {/* ---------- Popup ---------- */}
      <Modal
        open={open}
        onClose={close}
        title={
          type === "create"
            ? `Add a new ${label}`
            : type === "update"
            ? `Edit ${label}`
            : `Delete this ${label}?`
        }
      >
        {type === "delete" ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-textSecondary">
              {itemName ? (
                <>
                  You're about to delete <b className="text-textPrimary">{itemName}</b>.{" "}
                </>
              ) : null}
              This can't be undone, and related data may be removed too.
            </p>

            {deleteError && (
              <p role="alert" className="rounded-lg bg-dangerLight text-danger text-sm px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={deleting}
                className="rounded-lg border border-border bg-cardBg px-4 py-2.5 text-sm font-medium text-textPrimary hover:bg-bg disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        ) : forms[table] ? (
          <div className="modal-form">{forms[table](type, data, onFormSuccess)}</div>
        ) : (
          <p className="text-sm text-textSecondary">This form isn't available yet.</p>
        )}
      </Modal>
    </>
  );
};

export default FormModal;