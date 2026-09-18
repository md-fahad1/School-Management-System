import ReturnBookButton from "./ReturnBookButton";

type Loan = {
  id: string;
  status: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string;
  fineAmount: number;
  bookTitle: string;
  borrowerName: string;
};

const statusBadge: { [key: string]: string } = {
  BORROWED: "bg-infoLight text-info",
  RETURNED: "bg-successLight text-success",
  OVERDUE: "bg-dangerLight text-danger",
  LOST: "bg-dangerLight text-danger",
};

const LoanCard = ({ item, role }: { item: Loan; role: string }) => {
  return (
    <div className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header: book title, borrower, status badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-textPrimary">{item.bookTitle}</h3>
          <p className="text-xs text-textMuted">{item.borrowerName}</p>
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
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Borrowed</p>
          <p className="text-textPrimary font-medium">{item.borrowedAt}</p>
        </div>
        <div>
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Due</p>
          <p className="text-textPrimary font-medium">{item.dueDate}</p>
        </div>
      </div>

      {item.fineAmount > 0 && (
        <div className="text-sm">
          <p className="text-textMuted text-xs uppercase tracking-wide mb-1">Fine</p>
          <p className="text-danger font-medium">${item.fineAmount.toFixed(2)}</p>
        </div>
      )}

      {/* Footer: return button (only for active loans) */}
      {role === "admin" && item.status === "BORROWED" && (
        <div className="flex items-center justify-end pt-3 border-t border-border">
          <ReturnBookButton loanId={item.id} />
        </div>
      )}
    </div>
  );
};

export default LoanCard;