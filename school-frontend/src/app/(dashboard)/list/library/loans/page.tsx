import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import IssueBookModal from "@/components/IssueBookModal";
import ReturnBookButton from "@/components/ReturnBookButton";
import { getBookLoans } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Link from "next/link";
import LoanCard from "@/components/LoanCard";
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

const columns = [
  { header: "Book", accessor: "bookTitle" },
  { header: "Borrower", accessor: "borrowerName", className: "hidden md:table-cell" },
  { header: "Borrowed", accessor: "borrowedAt", className: "hidden lg:table-cell" },
  { header: "Due", accessor: "dueDate", className: "hidden lg:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Fine", accessor: "fineAmount", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const statusColor: { [key: string]: string } = {
  BORROWED: "text-blue-600",
  RETURNED: "text-green-600",
  OVERDUE: "text-red-600",
  LOST: "text-red-800",
};

const LibraryLoansPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const loans = await getBookLoans();

  const renderRow = (item: Loan) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="p-4">
        <h3 className="font-semibold">{item.bookTitle}</h3>
      </td>
      <td className="hidden md:table-cell">{item.borrowerName}</td>
      <td className="hidden lg:table-cell">{item.borrowedAt}</td>
      <td className="hidden lg:table-cell">{item.dueDate}</td>
      <td className={statusColor[item.status] ?? ""}>{item.status}</td>
      <td className="hidden lg:table-cell">
        {item.fineAmount ? `$${item.fineAmount.toFixed(2)}` : "-"}
      </td>
      <td>
        {role === "admin" && item.status === "BORROWED" && (
          <ReturnBookButton loanId={item.id} />
        )}
      </td>
    </tr>
  );

  return (
    <div className="	bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">Library — Loans</h1>
        <div className="flex items-center gap-4">
          <Link href="/list/library">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-infoLight text-xs">
              Books
            </button>
          </Link>
          {role === "admin" && <IssueBookModal />}
        </div>
      </div>
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <LoanCard item={item} role={role} />}
        data={loans}
      />
      <Pagination />
    </div>
  );
};

export default LibraryLoansPage;