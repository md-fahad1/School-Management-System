import FormModal from "@/components/FormModal";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getAttendances } from "@/lib/graphql/fetchers";
import { parsePage, type ListSearchParams } from "@/lib/pagination";
import { cookies } from "next/headers";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import AttendanceCard from "@/components/AttendanceCard";

type AttendanceRow = {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "LEAVE";
  studentId: string;
  lessonId: string;
  student: string;
  subject: string;
  class: string;
  teacher: string;
};

const columns = [
  { headerKey: "student", accessor: "student" },
  { headerKey: "subject", accessor: "subject" },
  { headerKey: "class", accessor: "class", className: "hidden md:table-cell" },
  { headerKey: "teacher", accessor: "teacher", className: "hidden md:table-cell" },
  { headerKey: "date", accessor: "date", className: "hidden md:table-cell" },
  { headerKey: "status", accessor: "status" },
  { headerKey: "actions", accessor: "action" },
];

const statusColor: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-yellow-100 text-yellow-700",
  EXCUSED: "bg-blue-100 text-blue-700",
  LEAVE: "bg-gray-100 text-gray-700",
};

const AttendanceListPage = async ({ searchParams }: { searchParams?: ListSearchParams }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const page = parsePage(searchParams?.page);
  const { rows: attendanceData, hasNextPage } = await getAttendances(page);

  const renderRow = (item: AttendanceRow) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="flex items-center gap-4 p-4">{item.student}</td>
      <td>{item.subject}</td>
      <td className="hidden md:table-cell">{item.class}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td className="hidden md:table-cell">{item.date}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            statusColor[item.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {item.status}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormModal table="attendance" type="update" data={item} />
              <FormModal table="attendance" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">All Attendance</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <SlidersHorizontal size={14} className="text-textSecondary" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <ArrowUpDown size={14} className="text-textSecondary" />
            </button>
            {(role === "admin" || role === "teacher") && (
              <>
                <Link
                  href="/list/attendance/mark"
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:bg-primaryDark transition-colors"
                >
                  Mark class
                </Link>
                <Link
                  href="/list/attendance/report"
                  className="px-3 py-1.5 rounded-lg border border-border text-textSecondary text-xs hover:bg-accentLight transition-colors"
                >
                  Monthly report
                </Link>
                <FormModal table="attendance" type="create" />
              </>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <AttendanceCard item={item} role={role} />}
        data={attendanceData}
      />
      {/* PAGINATION */}
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default AttendanceListPage;