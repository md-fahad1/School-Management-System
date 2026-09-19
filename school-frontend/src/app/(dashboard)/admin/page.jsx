import dynamic from "next/dynamic";
import Announcements from "@/components/Announcements";
import EventCalendar from "@/components/EventCalendar";
import UserCard from "@/components/UserCard";
import WelcomeCard from "@/components/WelcomeCard";
import { getDashboardCounts, getWeeklyAttendance } from "@/lib/graphql/fetchers";
import QuickActions from "@/components/QuickActions";
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
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        {/* WELCOME CARD */}
       <WelcomeCard />
{/* QUICK ACTIONS */}
<QuickActions />
{/* USER CARDS */}
<div className="flex gap-4 justify-between flex-wrap">
  <UserCard type="student" count={counts.studentCount} href="/list/students" />
  <UserCard type="teacher" count={counts.teacherCount} href="/list/teachers" />
  <UserCard type="parent" count={counts.parentCount} href="/list/parents" />
  <UserCard type="admin" count={counts.adminCount} href="/admin/create-staff" linkLabel="Manage staff" />
</div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row mt-2">
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