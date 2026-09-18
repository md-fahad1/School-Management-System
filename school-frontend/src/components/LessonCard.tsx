import FormModal from "./FormModal";

type Lesson = {
  id: string;
  subject: string;
  class: string;
  teacher: string;
};

const LessonCard = ({ item, role }: { item: Lesson; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-textPrimary">{item.subject}</h3>
        <p className="text-xs text-textMuted">{item.class}</p>
      </div>

      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Teacher</p>
        <p className="text-textPrimary font-medium">{item.teacher || "-"}</p>
      </div>

      {role === "admin" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="lesson" type="update" data={item} />
          <FormModal table="lesson" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default LessonCard;