import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import { getMySchedule } from "@/lib/graphql/fetchers";

const TeacherPage = async () => {
  const schedule = await getMySchedule();

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-cardBg border border-border shadow-sm p-4 rounded-2xl">
          <h1 className="text-xl font-semibold text-textPrimary">Schedule</h1>
          <BigCalendar events={schedule} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;