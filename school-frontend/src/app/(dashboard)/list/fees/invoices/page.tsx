import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import GenerateInvoiceModal from "@/components/GenerateInvoiceModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import { getInvoices } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Link from "next/link";

type Invoice = {
  id: string;
  period: string;
  amount: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  status: string;
  studentName: string;
};

const columns = [
  { header: "Student", accessor: "studentName" },
  { header: "Period", accessor: "period", className: "hidden md:table-cell" },
  { header: "Amount", accessor: "amount", className: "hidden lg:table-cell" },
  { header: "Paid", accessor: "amountPaid", className: "hidden lg:table-cell" },
  { header: "Balance", accessor: "balance" },
  { header: "Due", accessor: "dueDate", className: "hidden lg:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Actions", accessor: "action" },
];

const statusColor: { [key: string]: string } = {
  PENDING: "text-yellow-600",
  PARTIAL: "text-blue-600",
  PAID: "text-green-600",
  OVERDUE: "text-red-600",
  CANCELLED: "text-gray-400",
};

const InvoicesPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const invoices = await getInvoices();

  const renderRow = (item: Invoice) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <h3 className="font-semibold">{item.studentName}</h3>
      </td>
      <td className="hidden md:table-cell">{item.period}</td>
      <td className="hidden lg:table-cell">${item.amount.toFixed(2)}</td>
      <td className="hidden lg:table-cell">${item.amountPaid.toFixed(2)}</td>
      <td>${item.balance.toFixed(2)}</td>
      <td className="hidden lg:table-cell">{item.dueDate}</td>
      <td className={statusColor[item.status] ?? ""}>{item.status}</td>
      <td>
        {role === "admin" && item.balance > 0 && item.status !== "CANCELLED" && (
          <RecordPaymentModal invoiceId={item.id} balance={item.balance} />
        )}
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Fees — Invoices</h1>
        <div className="flex items-center gap-4">
          <Link href="/list/fees">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaSky text-xs">
              Fee structures
            </button>
          </Link>
          {role === "admin" && <GenerateInvoiceModal />}
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={invoices} />
      <Pagination />
    </div>
  );
};

export default InvoicesPage;