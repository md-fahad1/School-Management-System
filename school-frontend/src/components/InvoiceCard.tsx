import RecordPaymentModal from "./RecordPaymentModal";
import ApplyDiscountModal from "./ApplyDiscountModal";
import ApplyFineModal from "./ApplyFineModal";

type Invoice = {
  id: string;
  period: string;
  amount: number;
  amountPaid: number;
  discountAmount: number;
  fineAmount: number;
  payableAmount: number;
  balance: number;
  dueDate: string;
  status: string;
  studentName: string;
};

const statusBadge: { [key: string]: string } = {
  PENDING: "bg-warningLight text-warning",
  PARTIAL: "bg-infoLight text-info",
  PAID: "bg-successLight text-success",
  OVERDUE: "bg-dangerLight text-danger",
  CANCELLED: "bg-bg text-textMuted",
};

const InvoiceCard = ({ item, canManage }: { item: Invoice; canManage: boolean }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: student, status badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-textPrimary">{item.studentName}</h3>
          <p className="text-xs text-textMuted">{item.period}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
            statusBadge[item.status] ?? "bg-bg text-textMuted"
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Amount</p>
          <p className="text-textPrimary font-medium">${item.amount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Balance</p>
          <p className="text-textPrimary font-semibold">${item.balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {item.discountAmount > 0 && (
          <div>
            <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Discount</p>
            <p className="text-warning font-medium">-${item.discountAmount.toFixed(2)}</p>
          </div>
        )}
        {item.fineAmount > 0 && (
          <div>
            <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Fine</p>
            <p className="text-danger font-medium">+${item.fineAmount.toFixed(2)}</p>
          </div>
        )}
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Paid</p>
          <p className="text-textPrimary font-medium">${item.amountPaid.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-sm">
        <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Due date</p>
        <p className="text-textPrimary font-medium">{item.dueDate}</p>
      </div>

      {/* Footer: payment / discount / fine actions */}
      {canManage && item.status !== "CANCELLED" && (
        <div className="flex items-center flex-wrap justify-end gap-2 pt-3 border-t border-border">
          {item.balance > 0 && <RecordPaymentModal invoiceId={item.id} balance={item.balance} />}
          {item.status !== "PAID" && (
            <>
              <ApplyDiscountModal invoiceId={item.id} amount={item.amount} />
              <ApplyFineModal invoiceId={item.id} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;