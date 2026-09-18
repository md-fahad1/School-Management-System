import Table from "@/components/Table";
import { getStaffAttendances } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import StaffAttendanceMarkModal from "@/components/StaffAttendanceMarkModal";
import StaffAttendanceCard from "@/components/StaffAttendanceCard";
type Row = {
  id: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
  remarks: string;
  userId: string;
  staff: string;
  role: string;
};

const columns = [
  { header: "Staff", accessor: "staff" },
  { header: "Role", accessor: "role", className: "hidden md:table-cell" },
  { header: "Date", accessor: "date" },
  { header: "Status", accessor: "status" },
  { header: "Remarks", accessor: "remarks", className: "hidden md:table-cell" },
];

const statusColor: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-yellow-100 text-yellow-700",
  EARLY_LEAVE: "bg-orange-100 text-orange-700",
  ON_LEAVE: "bg-blue-100 text-blue-700",
};

const StaffAttendanceListPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const data = await getStaffAttendances();

  const renderRow = (item: Row) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="flex items-center gap-4 p-4">{item.staff}</td>
      <td className="hidden md:table-cell">{item.role}</td>
      <td>{item.date}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            statusColor[item.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {item.status}
        </span>
      </td>
      <td className="hidden md:table-cell">{item.remarks}</td>
    </tr>
  );

  return (
    <div className="	bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">Staff Attendance</h1>
        {(role === "admin" || role === "principal") && <StaffAttendanceMarkModal />}
      </div>
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <StaffAttendanceCard item={item} />}
        data={data}
      />
    </div>
  );
};

export default StaffAttendanceListPage;