import { Building2 } from "lucide-react";
import FormModal from "./FormModal";
import { DEPARTMENT_TYPE_LABEL, type DepartmentItem } from "@/lib/academic";

const DepartmentCard = ({ item }: { item: DepartmentItem }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-accentLight flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-accent" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-textPrimary text-base truncate">{item.name}</h3>
          <p className="text-xs text-textMuted">
            {DEPARTMENT_TYPE_LABEL[item.type] ?? item.type}
            {item.code ? ` · ${item.code}` : ""}
          </p>
        </div>
      </div>

      {item.description && <p className="text-sm text-textSecondary">{item.description}</p>}

      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Classes using it</p>
        <p className="text-textPrimary font-medium">{item.classCount}</p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        <FormModal table="department" type="update" data={item} />
        <FormModal table="department" type="delete" id={item.id} itemName={item.name} />
      </div>
    </div>
  );
};

export default DepartmentCard;