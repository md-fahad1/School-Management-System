"use client";

import Link from "next/link";
import { GraduationCap, Users, UserRound, ShieldCheck, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

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

// type -> translation key under the "dashboard" namespace, for the "Total ..." line.
const totalKeyMap: { [key: string]: string } = {
  student: "totalStudents",
  teacher: "totalTeachers",
  parent: "totalParents",
  admin: "totalAdmins",
};

type Props = {
  type: string;
  count?: number;
  /** Dile poura card ta click-able hoy. Na dile ager moto sadharon card. */
  href?: string;
  /** true dile "Manage staff" dekhabe, na dile default "View all". */
  manageLink?: boolean;
};

const UserCard = ({ type, count = 0, href, manageLink = false }: Props) => {
  const { t } = useTranslation();
  const Icon = iconMap[type] ?? GraduationCap;
  const badgeClass = badgeMap[type] ?? "bg-infoLight text-info";
  const totalLabel = t(`dashboard.${totalKeyMap[type] ?? "totalStudents"}`);
  const linkLabel = manageLink ? t("dashboard.manageStaff") : t("dashboard.viewAll");
  const base =
    "rounded-2xl bg-cardBg border border-border p-4 flex-1 min-w-[150px] shadow-sm";

  const content = (
    <>
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${badgeClass}`}>
          <Icon size={20} />
        </div>
        {href && (
          <ChevronRight
            size={18}
            className="text-textMuted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
            aria-hidden="true"
          />
        )}
      </div>
      <h1 className="text-2xl font-semibold mt-3 text-textPrimary">
        {count.toLocaleString()}
      </h1>
      <h2 className="capitalize text-sm text-textSecondary mt-0.5">{totalLabel}</h2>
      {href && <p className="text-xs font-medium text-accent mt-2">{linkLabel}</p>}
    </>
  );

  if (!href) return <div className={base}>{content}</div>;

  return (
    <Link
      href={href}
      aria-label={`${linkLabel}: ${type}s`}
      className={`${base} group block transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md`}
    >
      {content}
    </Link>
  );
};

export default UserCard;