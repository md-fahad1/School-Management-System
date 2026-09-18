type Row = {
  id: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
  remarks: string;
  teacherId: string;
  teacher: string;
};

const statusColor: Record<string, string> = {
  PRESENT: "bg-successLight text-success",
  ABSENT: "bg-dangerLight text-danger",
  LATE: "bg-warningLight text-warning",
  EARLY_LEAVE: "bg-warningLight text-warning",
  ON_LEAVE: "bg-infoLight text-info",
};

const TeacherAttendanceCard = ({ item }: { item: Row }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-textPrimary">{item.teacher}</h3>
          <p className="text-xs text-textMuted">{item.date}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
            statusColor[item.status] ?? "bg-bg text-textMuted"
          }`}
        >
          {item.status}
        </span>
      </div>

      {item.remarks && (
        <div className="text-sm">
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Remarks</p>
          <p className="text-textPrimary">{item.remarks}</p>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceCard;