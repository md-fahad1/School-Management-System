import { STATUS_LABEL, type StudentStatus } from "@/lib/studentStatus";

const STATUS_STYLE: Record<StudentStatus, string> = {
  ACTIVE: "bg-successLight text-success",
  INACTIVE: "bg-bg text-textMuted border border-border",
  SUSPENDED: "bg-warningLight text-warning",
  TRANSFERRED: "bg-infoLight text-textSecondary",
  GRADUATED: "bg-infoLight text-info",
  ALUMNI: "bg-infoLight text-info",
  DROPPED: "bg-dangerLight text-danger",
  EXPELLED: "bg-dangerLight text-danger",
};

export default function StudentStatusBadge({ status }: { status?: string | null }) {
  const key = (status ?? "ACTIVE") as StudentStatus;
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
        STATUS_STYLE[key] ?? "bg-bg text-textMuted border border-border"
      }`}
    >
      {STATUS_LABEL[key] ?? status}
    </span>
  );
}