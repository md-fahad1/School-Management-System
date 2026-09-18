import Image from "next/image";
import FormModal from "./FormModal";

type Subject = {
  id: string;
  name: string;
  teachers: string[];
};

const SubjectCard = ({ item, role }: { item: Subject; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: icon + subject name */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-accentLight flex items-center justify-center shrink-0">
          <Image src="/subject.png" alt="" width={20} height={20} />
        </div>
        <h3 className="font-semibold text-textPrimary text-base">{item.name}</h3>
      </div>

      {/* Teachers as tags */}
      <div>
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1.5">Teachers</p>
        {item.teachers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {item.teachers.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-1 rounded-full bg-accentLight text-accent font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-textMuted">No teacher assigned</p>
        )}
      </div>

      {/* Footer: edit / delete */}
      {role === "admin" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="subject" type="update" data={item} />
          <FormModal table="subject" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default SubjectCard;