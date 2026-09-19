import Link from "next/link";
import {
  GraduationCap,
  Users,
  UserRound,
  Megaphone,
  School,
  CalendarDays,
  CalendarCheck,
  Wallet,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import FormModal from "./FormModal";

const tileClass =
  "group flex h-full w-full flex-col items-start gap-2 rounded-xl border border-border bg-bg/60 p-3 text-left transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accentLight hover:shadow-sm";

// Ekta tile er vitorer design (icon + nam + chhoto bornona).
const tileBody = (
  Icon: React.ElementType,
  tone: string,
  label: string,
  hint: string
) => (
  <>
    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
      <Icon size={18} />
    </span>
    <span className="text-sm font-semibold text-textPrimary">{label}</span>
    <span className="text-xs leading-snug text-textSecondary">{hint}</span>
  </>
);

const QuickActions = () => {
  return (
    <section
      aria-labelledby="quick-actions-title"
      className="rounded-2xl border border-border bg-cardBg p-5 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="quick-actions-title" className="text-base font-semibold text-textPrimary">
            Quick actions
          </h2>
          <p className="text-xs text-textSecondary">Your most common tasks, one click away.</p>
        </div>
        <Link
          href="/help"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <HelpCircle size={14} />
          Need help?
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FormModal
          table="student"
          type="create"
          triggerClassName={tileClass}
          trigger={tileBody(GraduationCap, "bg-infoLight text-info", "Add student", "Enrol a new student")}
        />
        <FormModal
          table="teacher"
          type="create"
          triggerClassName={tileClass}
          trigger={tileBody(Users, "bg-warningLight text-warning", "Add teacher", "Create a teacher account")}
        />
        <FormModal
          table="parent"
          type="create"
          triggerClassName={tileClass}
          trigger={tileBody(UserRound, "bg-successLight text-success", "Add parent", "Needed before adding a student")}
        />
        <FormModal
          table="announcement"
          type="create"
          triggerClassName={tileClass}
          trigger={tileBody(Megaphone, "bg-accentLight text-accent", "Post announcement", "Share news with everyone")}
        />
        <FormModal
          table="class"
          type="create"
          triggerClassName={tileClass}
          trigger={tileBody(School, "bg-infoLight text-info", "Add class", "Like “Class 5-A”")}
        />
        <FormModal
          table="event"
          type="create"
          triggerClassName={tileClass}
          trigger={tileBody(CalendarDays, "bg-warningLight text-warning", "Add event", "Sports day, meetings…")}
        />
        <Link href="/list/attendance" className={tileClass}>
          {tileBody(CalendarCheck, "bg-successLight text-success", "Attendance", "Mark or view today")}
        </Link>
        <Link href="/list/fees" className={tileClass}>
          {tileBody(Wallet, "bg-accentLight text-accent", "Fees", "Invoices and payments")}
        </Link>
      </div>

      <p className="mt-4 flex items-center gap-1 text-xs text-textMuted">
        <ChevronRight size={14} />
        Tip: add a parent first, then add the student and pick that parent.
      </p>
    </section>
  );
};

export default QuickActions;