import React from "react";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import { parsePage } from "@/lib/pagination";
import { getAuditLogs } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const columns = [
  { headerKey: "time", accessor: "createdAt" },
  { headerKey: "action", accessor: "action" },
  { headerKey: "status", accessor: "success" },
  { headerKey: "details", accessor: "metadata" },
  { headerKey: "userId", accessor: "userId", className: "hidden lg:table-cell" },
];

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

// Turns { oldMark: 72, newMark: 82 } into "oldMark: 72, newMark: 82" —
// good enough for a readable audit trail without a bespoke renderer
// per action type.
function formatMetadata(raw?: string) {
  if (!raw) return "-";
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join(", ");
  } catch {
    return raw;
  }
}

const AuditLogPage = async ({
  searchParams,
}: {
  searchParams: { action?: string; page?: string };
}) => {
  const role = cookies().get("role")?.value;
  if (role !== "admin") {
    redirect("/");
  }

  const page = parsePage(searchParams?.page);
  const { rows: logs, hasNextPage } = await getAuditLogs({ page, action: searchParams?.action });

  const renderRow = (item: {
    id: string;
    userId?: string;
    action: string;
    success: boolean;
    metadata?: string;
    createdAt: string;
  }) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors align-top"
    >
      <td className="p-4 whitespace-nowrap">{formatTime(item.createdAt)}</td>
      <td className="whitespace-nowrap">{item.action}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {item.success ? "Success" : "Failed"}
        </span>
      </td>
      <td className="text-xs text-gray-600 max-w-[320px]">{formatMetadata(item.metadata)}</td>
      <td className="hidden lg:table-cell text-xs text-gray-400">{item.userId ?? "-"}</td>
    </tr>
  );

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">Audit Log</h1>
        <form className="flex gap-2 items-center">
          <select
            name="action"
            defaultValue={searchParams?.action ?? ""}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">All actions</option>
            <option value="LOGIN_SUCCESS">Login</option>
            <option value="LOGIN_FAILURE">Failed login</option>
            <option value="STUDENT_CREATE">Student created</option>
            <option value="STUDENT_UPDATE">Student updated</option>
            <option value="STUDENT_DELETE">Student deleted</option>
            <option value="RESULT_CREATE">Result created</option>
            <option value="RESULT_UPDATE">Result updated</option>
            <option value="RESULT_DELETE">Result deleted</option>
            <option value="PAYMENT_RECORDED">Payment recorded</option>
            <option value="LEAVE_DECIDED">Leave decided</option>
            <option value="ACCESS_DENIED">Access denied</option>
          </select>
          <button className="bg-lamaYellow px-3 py-2 rounded-md text-sm" type="submit">
            Filter
          </button>
        </form>
      </div>
      <Table columns={columns} renderRow={renderRow} data={logs} />
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default AuditLogPage;