import { MoreVertical } from "lucide-react";

const items = [
  {
    tone: "info",
    title: "Lorem ipsum dolor sit",
    date: "2025-01-01",
    body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, expedita. Rerum, quidem facilis?",
  },
  {
    tone: "accent",
    title: "Lorem ipsum dolor sit",
    date: "2025-01-01",
    body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, expedita. Rerum, quidem facilis?",
  },
  {
    tone: "warning",
    title: "Lorem ipsum dolor sit",
    date: "2025-01-01",
    body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, expedita. Rerum, quidem facilis?",
  },
];

const toneClass: { [key: string]: string } = {
  info: "bg-infoLight",
  accent: "bg-accentLight",
  warning: "bg-warningLight",
};

const Announcements = () => {
  return (
    <div className="bg-cardBg border border-border shadow-sm rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-textPrimary">Notice Board</h1>
        <button type="button" className="text-textMuted hover:text-textSecondary" aria-label="More options">
          <MoreVertical size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3 mt-4">
        {items.map((item, i) => (
          <div key={i} className={`${toneClass[item.tone]} rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-textPrimary text-sm">{item.title}</h2>
              <span className="text-[10px] text-textMuted bg-cardBg rounded-md px-2 py-1 shrink-0 ml-2">
                {item.date}
              </span>
            </div>
            <p className="text-sm text-textSecondary mt-1">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;