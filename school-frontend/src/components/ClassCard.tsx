import { School } from "lucide-react";
import FormModal from "./FormModal";

type Class = {
  id: string;
  name: string;
  capacity: number;
  grade: number | string;
  supervisor: string;
  department?: string;
};

const ClassCard = ({ item, role }: { item: Class; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: icon + class name */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-accentLight flex items-center justify-center shrink-0">
          <School size={20} className="text-accent" />
        </div>
        <h3 className="font-semibold text-textPrimary text-base">{item.name}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Capacity</p>
          <p className="text-textPrimary font-medium">{item.capacity}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Grade</p>
          <p className="text-textPrimary font-medium">{item.grade}</p>
        </div>
      </div>

      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Supervisor</p>
        <p className="text-textPrimary font-medium">{item.supervisor || "-"}</p>
      </div>
            <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Department</p>
        <p className="text-textPrimary font-medium">{item.department || "-"}</p>
      </div>

      {/* Footer: edit / delete */}
      {role === "admin" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="class" type="update" data={item} />
          <FormModal table="class" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default ClassCard;