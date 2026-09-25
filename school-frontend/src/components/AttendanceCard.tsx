import FormModal from "./FormModal";

type AttendanceRow = {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "LEAVE";
  studentId: string;
  lessonId: string;
  student: string;
  subject: string;
  class: string;
  teacher: string;
};

const statusColor: Record<string, string> = {
  PRESENT: "bg-successLight text-success",
  ABSENT: "bg-dangerLight text-danger",
  LATE: "bg-yellow-100 text-yellow-700",
  EXCUSED: "bg-blue-100 text-blue-700",
  LEAVE: "bg-gray-100 text-gray-700",
};

const AttendanceCard = ({ item, role }: { item: AttendanceRow; role: string }) => {
  const canEdit = role === "admin" || role === "teacher";

  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: student + subject, status badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-textPrimary">{item.student}</h3>
          <p className="text-xs text-textMuted">{item.subject}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
            statusColor[item.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Class</p>
          <p className="text-textPrimary font-medium">{item.class}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Teacher</p>
          <p className="text-textPrimary font-medium">{item.teacher || "-"}</p>
        </div>
      </div>

      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Date</p>
        <p className="text-textPrimary font-medium">{item.date}</p>
      </div>

      {/* Footer: edit / delete */}
      {canEdit && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="attendance" type="update" data={item} />
          <FormModal table="attendance" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;