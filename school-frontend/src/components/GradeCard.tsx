import { Layers } from "lucide-react";
import FormModal from "./FormModal";

const GradeCard = ({ item, role }: { item: { id: string; level: number }; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-accentLight flex items-center justify-center shrink-0">
          <Layers size={20} className="text-accent" />
        </div>
        <h3 className="font-semibold text-textPrimary text-base">Grade {item.level}</h3>
      </div>

      {role === "admin" && (
        <div className="flex items-center gap-2">
          <FormModal table="grade" type="update" data={item} />
          <FormModal table="grade" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default GradeCard;