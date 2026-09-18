import FormModal from "./FormModal";

type Exam = {
  id: string;
  subject: string;
  class: string;
  teacher: string;
  date: string;
};

const ExamCard = ({ item, role }: { item: Exam; role: string }) => {
  const canEdit = role === "admin" || role === "teacher";

  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: subject + class */}
      <div>
        <h3 className="font-semibold text-textPrimary">{item.subject}</h3>
        <p className="text-xs text-textMuted">{item.class}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Teacher</p>
          <p className="text-textPrimary font-medium">{item.teacher || "-"}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Date</p>
          <p className="text-textPrimary font-medium">{item.date}</p>
        </div>
      </div>

      {/* Footer: edit / delete */}
      {canEdit && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="exam" type="update" data={item} />
          <FormModal table="exam" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default ExamCard;