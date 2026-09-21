import { MoreVertical } from "lucide-react";

type AnnouncementItem = {
  id: string | number;
  title: string;
  date: string;
  body?: string;
};

const toneClass = ["bg-infoLight", "bg-accentLight", "bg-warningLight"];

const Announcements = ({ items = [] }: { items?: AnnouncementItem[] }) => {
  return (
    <div className="bg-cardBg border border-border shadow-sm rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-textPrimary">Notice Board</h1>
        <button type="button" className="text-textMuted hover:text-textSecondary" aria-label="More options">
          <MoreVertical size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3 mt-4">
        {items.length === 0 ? (
          <p className="text-sm text-textMuted py-2">No announcements yet.</p>
        ) : (
          items.map((item, i) => (
            <div key={item.id} className={`${toneClass[i % toneClass.length]} rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-textPrimary text-sm">{item.title}</h2>
                <span className="text-[10px] text-textMuted bg-cardBg rounded-md px-2 py-1 shrink-0 ml-2">
                  {item.date}
                </span>
              </div>
              {item.body && <p className="text-sm text-textSecondary mt-1">{item.body}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;