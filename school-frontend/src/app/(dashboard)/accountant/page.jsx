export const dynamic = "force-dynamic";
import { getFeeSummary, getDefaulters } from "@/lib/graphql/fetchers";
import Link from "next/link";

const AccountantPage = async () => {
  const summary = await getFeeSummary();
  const defaulters = await getDefaulters();

  return (
    <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cardBg border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-textMuted">Total invoiced</p>
          <p className="text-xl font-semibold text-textPrimary">${summary.totalInvoiced.toFixed(2)}</p>
        </div>
        <div className="bg-cardBg border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-textMuted">Total collected</p>
          <p className="text-xl font-semibold text-success">${summary.totalCollected.toFixed(2)}</p>
        </div>
        <div className="bg-cardBg border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-textMuted">Total pending</p>
          <p className="text-xl font-semibold text-warning">${summary.totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-cardBg border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-textMuted">Overdue invoices</p>
          <p className="text-xl font-semibold text-danger">{summary.overdueCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/list/fees">
          <button className="bg-warningLight text-warning px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">Manage fee structures</button>
        </Link>
        <Link href="/list/fees/invoices">
          <button className="bg-infoLight text-info px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">View all invoices</button>
        </Link>
      </div>

      <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl">
        <h2 className="text-lg font-semibold text-textPrimary mb-4">Defaulters</h2>
        {defaulters.length === 0 ? (
          <p className="text-sm text-textMuted">No overdue invoices right now.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-textSecondary border-b border-border">
                <th className="p-2">Student</th>
                <th className="p-2">Period</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Due date</th>
              </tr>
            </thead>
            <tbody>
              {defaulters.map((d) => (
                <tr key={d.id} className="border-b border-border even:bg-bg/50">
                  <td className="p-2 text-textPrimary">{d.studentName}</td>
                  <td className="p-2 text-textSecondary">{d.period}</td>
                  <td className="p-2 text-danger">${d.balance.toFixed(2)}</td>
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
