import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import { getMySchedule, getMyChildren } from "@/lib/graphql/fetchers";

const ParentPage = async () => {
  const [schedule, children] = await Promise.all([getMySchedule(), getMyChildren()]);

  // One name if there's one child, "Emma & Liam" for two, "Emma +2" for more.
  const childrenLabel =
    children.length === 0
      ? ""
      : children.length === 1
      ? `${children[0].name} ${children[0].surname}`
      : children.length === 2
      ? `${children[0].name} & ${children[1].name}`
      : `${children[0].name} +${children.length - 1}`;

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-cardBg border border-border shadow-sm p-4 rounded-2xl">
          <h1 className="text-xl font-semibold text-textPrimary">
            Schedule{childrenLabel && ` (${childrenLabel})`}
          </h1>
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

export default ParentPage;