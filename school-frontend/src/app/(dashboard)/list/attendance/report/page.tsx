"use client";

import { useEffect, useState } from "react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { GET_CLASS_OPTIONS, GET_CLASS_ATTENDANCE_REPORT } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

type Summary = {
  studentId: string;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  leaveDays: number;
  percentage: number;
};

const inputCls =
  "w-full px-3 py-2 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent";

const now = new Date();

export default function AttendanceReportPage() {
  const [classOptions, setClassOptions] = useState<{ id: string; name: string }[]>([]);
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const result = await client.request<{ classes: { id: string; name: string }[] }>(
          GET_CLASS_OPTIONS
        );
        setClassOptions(result.classes);
      } catch (err) {
        console.error("Failed to load classes:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!classId) {
      setRows([]);
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      try {
        const client = await getClientGqlClient();
        const result = await client.request<{ classAttendanceReport: Summary[] }>(
          GET_CLASS_ATTENDANCE_REPORT,
          { classId, month, year }
        );
        setRows(result.classAttendanceReport);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load report"));
      } finally {
        setLoading(false);
      }
    })();
  }, [classId, month, year]);

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold text-textPrimary">Monthly attendance report</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 max-w-xl">
        <div>
          <label className="block mb-1 text-sm text-textSecondary">Class</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputCls}>
            <option value="">Select a class</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm text-textSecondary">Month</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputCls}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm text-textSecondary">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>

      {loading && <p className="text-sm text-textMuted mt-4">Loading...</p>}
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      {!loading && !error && classId && (
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-textMuted border-b border-border">
                <th className="p-3">Student</th>
                <th className="p-3">Present</th>
                <th className="p-3">Absent</th>
                <th className="p-3">Late</th>
                <th className="p-3">Excused</th>
                <th className="p-3">Leave</th>
                <th className="p-3">Total</th>
                <th className="p-3">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.studentId} className="border-b border-border even:bg-bg/50">
                  <td className="p-3 font-medium">{r.studentName}</td>
                  <td className="p-3">{r.presentDays}</td>
                  <td className="p-3">{r.absentDays}</td>
                  <td className="p-3">{r.lateDays}</td>
                  <td className="p-3">{r.excusedDays}</td>
                  <td className="p-3">{r.leaveDays}</td>
                  <td className="p-3">{r.totalDays}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.percentage >= 75
                          ? "bg-green-100 text-green-700"
                          : r.percentage >= 50
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-textMuted">
                    No attendance records for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}