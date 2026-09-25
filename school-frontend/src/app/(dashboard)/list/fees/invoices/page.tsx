import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import GenerateInvoiceModal from "@/components/GenerateInvoiceModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import ApplyDiscountModal from "@/components/ApplyDiscountModal";
import ApplyFineModal from "@/components/ApplyFineModal";
import { getInvoices } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Link from "next/link";
import InvoiceCard from "@/components/InvoiceCard";
import { parsePage, type ListSearchParams } from "@/lib/pagination";
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

const columns = [
  { headerKey: "student", accessor: "studentName" },
  { headerKey: "period", accessor: "period", className: "hidden md:table-cell" },
  { headerKey: "amount", accessor: "amount", className: "hidden lg:table-cell" },
  { headerKey: "discount", accessor: "discountAmount", className: "hidden lg:table-cell" },
  { headerKey: "fine", accessor: "fineAmount", className: "hidden lg:table-cell" },
  { headerKey: "paid", accessor: "amountPaid", className: "hidden lg:table-cell" },
  { headerKey: "balance", accessor: "balance" },
  { headerKey: "due", accessor: "dueDate", className: "hidden lg:table-cell" },
  { headerKey: "status", accessor: "status" },
  { headerKey: "actions", accessor: "action" },
];

const statusColor: { [key: string]: string } = {
  PENDING: "text-yellow-600",
  PARTIAL: "text-blue-600",
  PAID: "text-green-600",
  OVERDUE: "text-red-600",
  CANCELLED: "text-gray-400",
};

const InvoicesPage = async ({ searchParams }: { searchParams?: ListSearchParams }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const canManage = role === "admin" || role === "accountant";
  const page = parsePage(searchParams?.page);
  const { rows: invoices, hasNextPage } = await getInvoices(undefined, page);

  const renderRow = (item: Invoice) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="p-4">
        <h3 className="font-semibold">{item.studentName}</h3>
      </td>
      <td className="hidden md:table-cell">{item.period}</td>
      <td className="hidden lg:table-cell">${item.amount.toFixed(2)}</td>
      <td className="hidden lg:table-cell text-lamaYellowText">
        {item.discountAmount > 0 ? `-$${item.discountAmount.toFixed(2)}` : "-"}
      </td>
      <td className="hidden lg:table-cell text-red-500">
        {item.fineAmount > 0 ? `+$${item.fineAmount.toFixed(2)}` : "-"}
      </td>
      <td className="hidden lg:table-cell">${item.amountPaid.toFixed(2)}</td>
      <td>${item.balance.toFixed(2)}</td>
      <td className="hidden lg:table-cell">{item.dueDate}</td>
      <td className={statusColor[item.status] ?? ""}>{item.status}</td>
      <td>
        {canManage && item.status !== "CANCELLED" && (
          <div className="flex items-center gap-2 flex-wrap">
            {item.balance > 0 && <RecordPaymentModal invoiceId={item.id} balance={item.balance} />}
            {item.status !== "PAID" && (
              <>
                <ApplyDiscountModal invoiceId={item.id} amount={item.amount} />
                <ApplyFineModal invoiceId={item.id} />
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );

  return (
    <div className="	bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">Fees — Invoices</h1>
        <div className="flex items-center gap-4">
          <Link href="/list/fees">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-infoLight text-xs">
              Fee structures
            </button>
          </Link>
          <Link href="/list/fees/scholarships">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-infoLight text-xs">
              Scholarships
            </button>
          </Link>
          {canManage && <GenerateInvoiceModal />}
        </div>
      </div>
            <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <InvoiceCard item={item} canManage={canManage} />}
        data={invoices}
      />
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default InvoicesPage;