"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";

// USE LAZY LOADING
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
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
};

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
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
}) => {
  const router = useRouter();
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  const Form = () => {
    return type === "delete" && id ? (
      <form onSubmit={handleDelete} className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        {deleteError && (
          <span className="text-center text-sm text-red-500">{deleteError}</span>
        )}
        <button
          type="submit"
          disabled={deleting}
          className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table]
        ? forms[table](type, data, () => {
            setOpen(false);
            router.refresh();
          })
        : "Form not found!"
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;