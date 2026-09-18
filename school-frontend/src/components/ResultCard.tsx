import FormModal from "./FormModal";

type Result = {
  id: string;
  subject: string;
  class: string;
  teacher: string;
  student: string;
  type: "exam" | "assignment";
  date: string;
  score: number;
};

const ResultCard = ({ item, role }: { item: Result; role: string }) => {
  const canEdit = role === "admin" || role === "teacher";
  const scoreColor =
    item.score >= 60 ? "bg-successLight text-success" : item.score >= 40 ? "bg-warningLight text-warning" : "bg-dangerLight text-danger";

  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: subject + student, score badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-textPrimary">{item.subject}</h3>
          <p className="text-xs text-textMuted">{item.student}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${scoreColor}`}>
          {item.score}
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
          <FormModal table="result" type="update" data={item} />
          <FormModal table="result" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default ResultCard;