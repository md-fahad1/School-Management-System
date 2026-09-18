import FormModal from "./FormModal";

type Event = {
  id: string;
  title: string;
  class: string;
  date: string;
  startTime: string;
  endTime: string;
};

const EventCard = ({ item, role }: { item: Event; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-textPrimary">{item.title}</h3>
        <p className="text-xs text-textMuted">{item.class || "Whole school"}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Date</p>
          <p className="text-textPrimary font-medium">{item.date}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Start</p>
          <p className="text-textPrimary font-medium">{item.startTime}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">End</p>
          <p className="text-textPrimary font-medium">{item.endTime}</p>
        </div>
      </div>

      {role === "admin" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="event" type="update" data={item} />
          <FormModal table="event" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default EventCard;