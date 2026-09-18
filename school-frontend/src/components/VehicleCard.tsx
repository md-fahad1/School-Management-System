import FormModal from "./FormModal";

type Vehicle = {
  id: string;
  vehicleNumber: string;
  type: string;
  capacity: number;
  driverName: string;
  route: string;
  status: string;
  transportStaffName: string;
};

const statusColor: Record<string, string> = {
  ACTIVE: "bg-successLight text-success",
  MAINTENANCE: "bg-warningLight text-warning",
  INACTIVE: "bg-bg text-textMuted",
};

const VehicleCard = ({ item, role }: { item: Vehicle; role: string }) => {
  const canEdit = role === "admin";

  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: vehicle number + driver, status badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-textPrimary">{item.vehicleNumber}</h3>
          <p className="text-xs text-textMuted">{item.driverName}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
            statusColor[item.status] ?? "bg-bg text-textMuted"
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Type</p>
          <p className="text-textPrimary font-medium">{item.type}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Capacity</p>
          <p className="text-textPrimary font-medium">{item.capacity}</p>
        </div>
      </div>

      {item.route && (
        <div className="text-sm">
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Route</p>
          <p className="text-textPrimary font-medium">{item.route}</p>
        </div>
      )}

      {/* Footer: edit / delete */}
      {canEdit && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <FormModal table="vehicle" type="update" data={item} />
          <FormModal table="vehicle" type="delete" id={item.id} />
        </div>
      )}
    </div>
  );
};

export default VehicleCard;