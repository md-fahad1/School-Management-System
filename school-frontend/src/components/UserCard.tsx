import Image from "next/image";
import { GraduationCap, Users, UserRound, ShieldCheck, MoreVertical } from "lucide-react";

const iconMap: { [key: string]: React.ElementType } = {
  student: GraduationCap,
  teacher: Users,
  parent: UserRound,
  admin: ShieldCheck,
};

const badgeMap: { [key: string]: string } = {
  student: "bg-infoLight text-info",
  teacher: "bg-warningLight text-warning",
  parent: "bg-successLight text-success",
  admin: "bg-accentLight text-accent",
};

const UserCard = ({ type, count = 0 }: { type: string; count?: number }) => {
  const Icon = iconMap[type] ?? GraduationCap;
  const badgeClass = badgeMap[type] ?? "bg-infoLight text-info";

  return (
    <div className="rounded-2xl bg-cardBg border border-border p-4 flex-1 min-w-[150px] shadow-sm">
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${badgeClass}`}>
          <Icon size={20} />
        </div>
        <button
          type="button"
          className="text-textMuted hover:text-textSecondary"
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>
      </div>
      <h1 className="text-2xl font-semibold mt-3 text-textPrimary">
        {count.toLocaleString()}
      </h1>
      <h2 className="capitalize text-sm text-textSecondary mt-0.5">Total {type}s</h2>
    </div>
  );
};

export default UserCard;