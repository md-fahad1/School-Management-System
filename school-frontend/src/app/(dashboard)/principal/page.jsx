import dynamic from "next/dynamic";
import Link from "next/link";
import UserCard from "@/components/UserCard";
import { getDashboardCounts, getWeeklyAttendance, getLeaves } from "@/lib/graphql/fetchers";

const AttendanceChart = dynamic(() => import("@/components/AttendanceChart"), {
  loading: () => <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />,
});
const CountChart = dynamic(() => import("@/components/CountChart"), {
  loading: () => <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />,
});

const PrincipalPage = async () => {
  const [counts, attendance, pendingLeaves] = await Promise.all([
    getDashboardCounts(),
    getWeeklyAttendance(),
    getLeaves("PENDING"),
  ]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-4 justify-between flex-wrap">
        <UserCard type="student" count={counts.studentCount} />
        <UserCard type="teacher" count={counts.teacherCount} />
        <UserCard type="parent" count={counts.parentCount} />
        <div className="rounded-2xl bg-cardBg border border-border p-4 flex-1 min-w-[150px] shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] bg-warningLight px-2 py-1 rounded-full text-warning font-medium">
              Pending
            </span>
          </div>
          <h1 className="text-2xl font-semibold my-4 text-textPrimary">{pendingLeaves.length}</h1>
          <h2 className="text-sm font-medium text-textSecondary">Leave requests</h2>
        </div>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 h-[450px]">
          <CountChart boys={counts.boysCount} girls={counts.girlsCount} />
        </div>
        <div className="w-full lg:w-2/3 h-[450px]">
          <AttendanceChart data={attendance} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/list/leave">
          <button className="bg-warningLight text-warning px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">Review leave requests</button>
        </Link>
        <Link href="/list/teacher-attendance">
          <button className="bg-infoLight text-info px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">Teacher attendance</button>
        </Link>
        <Link href="/list/staff-attendance">
          <button className="bg-accentLight text-accent px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">Staff attendance</button>
        </Link>
      </div>

      {pendingLeaves.length > 0 && (
        <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Pending leave requests</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-textSecondary border-b border-border">
                <th className="p-2">Applicant</th>
                <th className="p-2">Type</th>
                <th className="p-2">From</th>
                <th className="p-2">To</th>
                <th className="p-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves.map((l) => (
                <tr key={l.id} className="border-b border-border even:bg-bg/50">
                  <td className="p-2 text-textPrimary">
                    {l.applicant} <span className="text-xs text-textMuted">({l.applicantRole})</span>
                  </td>
                  <td className="p-2">{l.leaveType}</td>
                  <td className="p-2">{l.startDate}</td>
                  <td className="p-2">{l.endDate}</td>
                  <td className="p-2">{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PrincipalPage;