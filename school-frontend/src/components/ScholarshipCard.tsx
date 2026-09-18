import DeactivateScholarshipButton from "./DeactivateScholarshipButton";

type Scholarship = {
  id: string;
  name: string;
  type: string;
  value: number;
  active: boolean;
  startDate: string;
  endDate: string | null;
  studentName: string;
};

const ScholarshipCard = ({ item, canManage }: { item: Scholarship; canManage: boolean }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: student + scholarship name, active/inactive badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-textPrimary">{item.studentName}</h3>
          <p className="text-xs text-textMuted">{item.name}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
            item.active ? "bg-successLight text-success" : "bg-bg text-textMuted"
          }`}
        >
          {item.active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Type</p>
          <p className="text-textPrimary font-medium">{item.type}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Value</p>
          <p className="text-textPrimary font-medium">
            {item.type === "PERCENTAGE" ? `${item.value}%` : `$${item.value.toFixed(2)}`}
          </p>
        </div>
      </div>

      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Period</p>
        <p className="text-textPrimary font-medium">
          {item.startDate} {item.endDate ? `– ${item.endDate}` : "(ongoing)"}
        </p>
      </div>

      {canManage && (
        <div className="flex items-center justify-end pt-3 border-t border-border">
          <DeactivateScholarshipButton id={item.id} active={item.active} />
        </div>
      )}
    </div>
  );
};

export default ScholarshipCard;