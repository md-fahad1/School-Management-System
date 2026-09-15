import dynamic from "next/dynamic";
import Announcements from "@/components/Announcements";
import EventCalendar from "@/components/EventCalendar";
import UserCard from "@/components/UserCard";
import { getDashboardCounts, getWeeklyAttendance } from "@/lib/graphql/fetchers";

// recharts is a heavy dependency — split these into their own chunk so
// the dashboard shell (cards, calendar) renders immediately and the
// charts stream in right after, instead of blocking initial JS parse.
const AttendanceChart = dynamic(() => import("@/components/AttendanceChart"), {
  loading: () => <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />,
});
const CountChart = dynamic(() => import("@/components/CountChart"), {
  loading: () => <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />,
});
const FinanceChart = dynamic(() => import("@/components/FinanceChart"), {
  loading: () => <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />,
});

const AdminPage = async () => {
  const counts = await getDashboardCounts();
  const attendance = await getWeeklyAttendance();

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" count={counts.studentCount} />
          <UserCard type="teacher" count={counts.teacherCount} />
          <UserCard type="parent" count={counts.parentCount} />
          <UserCard type="admin" count={counts.adminCount} />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart boys={counts.boysCount} girls={counts.girlsCount} />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart data={attendance} />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;