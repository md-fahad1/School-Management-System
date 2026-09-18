import FormModal from "./FormModal";

type Announcement = {
  id: string;
  title: string;
  class: string;
  date: string;
};

const AnnouncementCard = ({ item, role }: { item: Announcement; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-textPrimary">{item.title}</h3>
        <p className="text-xs text-textMuted">{item.class || "Whole school"}</p>
      </div>

      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Date</p>
        <p className="text-textPrimary font-medium">{item.date}</p>
      </div>

      {role === "admin" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="announcement" type="update" data={item} />
          <FormModal table="announcement" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;