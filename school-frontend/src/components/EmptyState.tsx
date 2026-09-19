"use client";

import { useEffect, useState, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { Inbox, SearchX } from "lucide-react";
import FormModal from "./FormModal";

type FormTable = ComponentProps<typeof FormModal>["table"];

type Entry = {
  title: string;
  hint: string;
  /** Kon form er "Add ..." button dekhabe. Na dile button thakbe na. */
  table?: FormTable;
  /** Kon role ra add korte pare. */
  roles?: string[];
};

// Notun page er jonno shudhu ekta line add korlei hobe.
const ENTRIES: Record<string, Entry> = {
  "/list/students": {
    title: "No students yet",
    hint: "Add your first student, or use “Import CSV” above to add many at once.",
    table: "student",
    roles: ["admin"],
  },
  "/list/teachers": {
    title: "No teachers yet",
    hint: "Add your first teacher to get started.",
    table: "teacher",
    roles: ["admin"],
  },
  "/list/parents": {
    title: "No parents yet",
    hint: "Add parents first — every student needs to be linked to a parent.",
    table: "parent",
    roles: ["admin"],
  },
  "/list/classes": {
    title: "No classes yet",
    hint: "Create a class (for example “Class 5-A”) so you can enrol students in it.",
    table: "class",
    roles: ["admin"],
  },
  "/list/subjects": {
    title: "No subjects yet",
    hint: "Add the subjects your school teaches, like Math or English.",
    table: "subject",
    roles: ["admin"],
  },
  "/list/lessons": {
    title: "No lessons yet",
    hint: "A lesson links a subject, a class and a teacher on a weekday.",
    table: "lesson",
    roles: ["admin"],
  },
  "/list/exams": {
    title: "No exams yet",
    hint: "Schedule an exam for a lesson and it will show up here.",
    table: "exam",
    roles: ["admin", "teacher"],
  },
  "/list/assignments": {
    title: "No assignments yet",
    hint: "Create an assignment for a lesson and students will see it here.",
    table: "assignment",
    roles: ["admin", "teacher"],
  },
  "/list/results": {
    title: "No results yet",
    hint: "Record a student's marks for an exam or assignment.",
    table: "result",
    roles: ["admin", "teacher"],
  },
  "/list/announcements": {
    title: "No announcements yet",
    hint: "Post an announcement to share news with everyone.",
    table: "announcement",
    roles: ["admin"],
  },
  "/list/events": {
    title: "No events yet",
    hint: "Add an event such as a sports day or parent meeting.",
    table: "event",
    roles: ["admin"],
  },
  "/list/audit-logs": {
    title: "No activity recorded yet",
    hint: "When someone creates, edits or deletes something, it will be listed here.",
  },
};

const EmptyState = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  // Cookie shudhu browser e pawa jay, tai useEffect e porchi
  // (na hole server/browser er HTML mile na).
  const [role, setRole] = useState("");
  useEffect(() => {
    setRole(Cookies.get("role") ?? "");
  }, []);

  const wrap = "flex flex-col items-center text-center py-10 px-4";

  // 1) User kichu search korechilo kintu kichu pay ni
  if (search) {
    return (
      <div className={wrap}>
        <div className="w-14 h-14 rounded-2xl bg-accentLight text-accent flex items-center justify-center">
          <SearchX size={26} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-textPrimary">
          No results for “{search}”
        </h3>
        <p className="mt-1 text-sm text-textSecondary max-w-sm">
          Check the spelling, or try a shorter word.
        </p>
        <Link href={pathname} className="btn-secondary mt-4">
          Clear search
        </Link>
      </div>
    );
  }

  // 2) Sotti sotti kono data nei
  const entry = ENTRIES[pathname];
  const canAdd = Boolean(entry?.table && entry.roles?.includes(role));
  const hint = !entry
    ? "When records are added, they will show up here."
    : entry.roles && !canAdd
    ? "Nothing has been added here yet. Please check back later."
    : entry.hint;

  return (
    <div className={wrap}>
      <div className="w-14 h-14 rounded-2xl bg-infoLight text-info flex items-center justify-center">
        <Inbox size={26} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-textPrimary">
        {entry?.title ?? "Nothing here yet"}
      </h3>
      <p className="mt-1 text-sm text-textSecondary max-w-sm">{hint}</p>
      {canAdd && entry?.table && (
        <div className="mt-4">
          <FormModal table={entry.table} type="create" />
        </div>
      )}
    </div>
  );
};

export default EmptyState;