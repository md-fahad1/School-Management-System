"use client";

import { useEffect, useMemo, useState } from "react";
import { getClientGqlClient } from "@/lib/graphql/client";
import {
  GET_LESSONS_FOR_ATTENDANCE,
  GET_ACTIVE_STUDENTS_FOR_ATTENDANCE,
  BULK_MARK_ATTENDANCE,
} from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "@/components/ui/ToastProvider";

type Lesson = {
  id: string;
  name: string;
  classId: string;
  className?: string | null;
  subjectName?: string | null;
  day: string;
};

type StudentRow = {
  id: string;
  name: string;
  surname: string;
  classId?: string | null;
};

// Local calendar date (not UTC), so late-night / early-morning use picks the right day.
function todayLocal() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const inputCls =
  "w-full px-3 py-2 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent";

export default function MarkAttendance() {
  const toast = useToast();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [lessonId, setLessonId] = useState("");
  const [date, setDate] = useState(todayLocal());
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const [l, s] = await Promise.all([
          client.request<{ lessons: Lesson[] }>(GET_LESSONS_FOR_ATTENDANCE),
          client.request<{ students: StudentRow[] }>(GET_ACTIVE_STUDENTS_FOR_ATTENDANCE),
        ]);
        const sorted = [...l.lessons].sort((a, b) =>
          `${a.className}${a.subjectName}`.localeCompare(`${b.className}${b.subjectName}`),
        );
        setLessons(sorted);
        setStudents(s.students);
      } catch (err) {
        setLoadError(getErrorMessage(err, "Could not load lessons and students"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lesson = lessons.find((l) => l.id === lessonId);

  const classStudents = useMemo(() => {
    if (!lesson) return [];
    return students
      .filter((s) => s.classId === lesson.classId)
      .sort((a, b) => `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`));
  }, [students, lesson]);

  // Everyone starts as present; the teacher only flips the absentees.
  const isPresent = (id: string) => marks[id] ?? true;
  const presentCount = classStudents.filter((s) => isPresent(s.id)).length;

  const setAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    classStudents.forEach((s) => (next[s.id] = value));
    setMarks(next);
  };

  const handleLessonChange = (id: string) => {
    setLessonId(id);
    setMarks({});
  };

  const handleSave = async () => {
    if (!lesson || classStudents.length === 0) return;
    setSaving(true);
    try {
      const client = await getClientGqlClient();
      await client.request(BULK_MARK_ATTENDANCE, {
        input: {
          lessonId: lesson.id,
          date: `${date}T00:00:00.000Z`,
          entries: classStudents.map((s) => ({ studentId: s.id, present: isPresent(s.id) })),
        },
      });
      toast.success(`Attendance saved for ${classStudents.length} students.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save attendance"));
    } finally {
      setSaving(false);
    }
  };

  const lessonLabel = (l: Lesson) =>
    `${l.className ?? "-"} · ${l.subjectName ?? l.name} · ${l.day.charAt(0)}${l.day
      .slice(1, 3)
      .toLowerCase()}`;

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold text-textPrimary">Mark class attendance</h1>
      <p className="text-xs text-textMuted mt-1">
        Everyone starts as present. Mark the absentees, then save. Saving again for the same lesson
        and date updates the earlier marks.
      </p>

      {loading && <p className="text-sm text-textMuted mt-4">Loading...</p>}
      {loadError && <p className="text-sm text-red-500 mt-4">{loadError}</p>}

      {!loading && !loadError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-w-2xl">
            <div>
              <label className="block mb-1 text-sm text-textSecondary">Lesson</label>
              <select
                value={lessonId}
                onChange={(e) => handleLessonChange(e.target.value)}
                className={inputCls}
              >
                <option value="">Select a lesson</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {lessonLabel(l)}
                  </option>
                ))}
              </select>
              {lessons.length === 0 && (
                <p className="text-xs text-textMuted mt-1">
                  No lessons found. Teachers only see their own lessons.
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-textSecondary">Date</label>
              <input
                type="date"
                value={date}
                max={todayLocal()}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {lesson && (
            <div className="mt-6">
              {classStudents.length === 0 ? (
                <p className="text-sm text-textMuted">No active students in this class.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-textSecondary">
                      <span className="font-semibold text-success">{presentCount} present</span>
                      {" · "}
                      <span className="font-semibold text-danger">
                        {classStudents.length - presentCount} absent
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAll(true)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accentLight"
                      >
                        All present
                      </button>
                      <button
                        type="button"
                        onClick={() => setAll(false)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accentLight"
                      >
                        All absent
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-textMuted border-b border-border">
                          <th className="p-3 w-12">#</th>
                          <th className="p-3">Student</th>
                          <th className="p-3">Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((s, i) => {
                          const present = isPresent(s.id);
                          return (
                            <tr
                              key={s.id}
                              className="border-b border-border even:bg-bg/50"
                            >
                              <td className="p-3 text-textMuted">{i + 1}</td>
                              <td className="p-3 font-medium">
                                {s.name} {s.surname}
                              </td>
                              <td className="p-3">
                                <div className="inline-flex rounded-lg overflow-hidden border border-border text-xs">
                                  <button
                                    type="button"
                                    onClick={() => setMarks((m) => ({ ...m, [s.id]: true }))}
                                    className={`px-3 py-1.5 ${
                                      present ? "bg-success text-white" : "bg-bg text-textSecondary"
                                    }`}
                                  >
                                    Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMarks((m) => ({ ...m, [s.id]: false }))}
                                    className={`px-3 py-1.5 ${
                                      !present ? "bg-danger text-white" : "bg-bg text-textSecondary"
                                    }`}
                                  >
                                    Absent
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-4 bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save attendance"}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}