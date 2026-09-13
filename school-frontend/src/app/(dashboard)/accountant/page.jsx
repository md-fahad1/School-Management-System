import { getFeeSummary, getDefaulters } from "@/lib/graphql/fetchers";
import Link from "next/link";

const AccountantPage = async () => {
  const summary = await getFeeSummary();
  const defaulters = await getDefaulters();

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-gray-500">Total invoiced</p>
          <p className="text-xl font-semibold">${summary.totalInvoiced.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-gray-500">Total collected</p>
          <p className="text-xl font-semibold text-green-600">${summary.totalCollected.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-gray-500">Total pending</p>
          <p className="text-xl font-semibold text-yellow-600">${summary.totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <p className="text-xs text-gray-500">Overdue invoices</p>
          <p className="text-xl font-semibold text-red-600">{summary.overdueCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/list/fees">
          <button className="bg-lamaYellow px-4 py-2 rounded-md text-sm">Manage fee structures</button>
        </Link>
        <Link href="/list/fees/invoices">
          <button className="bg-lamaSky px-4 py-2 rounded-md text-sm">View all invoices</button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-4">Defaulters</h2>
        {defaulters.length === 0 ? (
          <p className="text-sm text-gray-500">No overdue invoices right now.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-2">Student</th>
                <th className="p-2">Period</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Due date</th>
              </tr>
            </thead>
            <tbody>
              {defaulters.map((d) => (
                <tr key={d.id} className="border-b even:bg-slate-50">
                  <td className="p-2">{d.studentName}</td>
                  <td className="p-2">{d.period}</td>
                  <td className="p-2 text-red-600">${d.balance.toFixed(2)}</td>
                  <td className="p-2">{d.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AccountantPage;