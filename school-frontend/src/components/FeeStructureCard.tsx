import FormModal from "./FormModal";

type FeeStructure = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
};

const FeeStructureCard = ({ item, role }: { item: FeeStructure; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-textPrimary">{item.name}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-successLight text-success font-medium shrink-0">
          ${item.amount.toFixed(2)}
        </span>
      </div>

      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Frequency</p>
        <p className="text-textPrimary font-medium">{item.frequency}</p>
      </div>

      {role === "admin" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="feeStructure" type="update" data={item} />
          <FormModal table="feeStructure" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default FeeStructureCard;