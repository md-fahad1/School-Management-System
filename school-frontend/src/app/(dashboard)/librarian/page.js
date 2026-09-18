import Link from "next/link";
import { getBooks, getBookLoans } from "@/lib/graphql/fetchers";

const LibrarianPage = async () => {
  const [books, activeLoans, overdueLoans] = await Promise.all([
    getBooks(),
    getBookLoans("BORROWED"),
    getBookLoans("OVERDUE"),
  ]);

  const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies ?? 0), 0);
  const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies ?? 0), 0);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-textMuted">Titles in catalog</p>
          <p className="text-xl font-semibold">{books.length}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-textMuted">Total copies</p>
          <p className="text-xl font-semibold">{totalCopies}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-textMuted">Available copies</p>
          <p className="text-xl font-semibold text-green-600">{availableCopies}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-textMuted">Currently borrowed</p>
          <p className="text-xl font-semibold text-yellow-600">{activeLoans.length}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-textMuted">Overdue</p>
          <p className="text-xl font-semibold text-red-600">{overdueLoans.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/list/library">
          <button className="bg-lamaYellow px-4 py-2 rounded-md text-sm">Manage books</button>
        </Link>
        <Link href="/list/library/loans">
          <button className="bg-lamaSky px-4 py-2 rounded-md text-sm">View all loans</button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-4">Overdue loans</h2>
        {overdueLoans.length === 0 ? (
          <p className="text-sm text-gray-500">No overdue loans right now.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-2">Borrower</th>
                <th className="p-2">Book</th>
                <th className="p-2">Due date</th>
                <th className="p-2">Fine</th>
              </tr>
            </thead>
            <tbody>
              {overdueLoans.map((l) => (
                <tr key={l.id} className="border-b even:bg-slate-50">
                  <td className="p-2">{l.borrowerName}</td>
                  <td className="p-2">{l.bookTitle}</td>
                  <td className="p-2">{l.dueDate}</td>
                  <td className="p-2 text-red-600">${l.fineAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LibrarianPage;