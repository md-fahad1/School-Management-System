import LeaveDecideButtons from "./LeaveDecideButtons";

type Row = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  applicantId: string;
  applicant: string;
  applicantRole: string;
  approvedBy: string;
};

const statusColor: Record<string, string> = {
  PENDING: "bg-warningLight text-warning",
  APPROVED: "bg-successLight text-success",
  REJECTED: "bg-dangerLight text-danger",
  CANCELLED: "bg-bg text-textMuted",
};

const LeaveCard = ({
  item,
  canDecide,
  myId,
}: {
  item: Row;
  canDecide: boolean;
  myId?: string;
}) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: applicant + role, status badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-textPrimary">{item.applicant}</h3>
          <p className="text-xs text-textMuted">
            {item.applicantRole} · {item.leaveType}
          </p>
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
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">From</p>
          <p className="text-textPrimary font-medium">{item.startDate}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">To</p>
          <p className="text-textPrimary font-medium">{item.endDate}</p>
        </div>
      </div>

      {item.reason && (
        <div className="text-sm">
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Reason</p>
          <p className="text-textPrimary">{item.reason}</p>
        </div>
      )}

      {/* Footer: approve/reject/cancel buttons */}
      <div className="flex items-center justify-end pt-3 border-t border-border">
        <LeaveDecideButtons
          id={item.id}
          status={item.status}
          canDecide={canDecide}
          isOwn={item.applicantId === myId}
        />
      </div>
    </div>
  );
};

export default LeaveCard;