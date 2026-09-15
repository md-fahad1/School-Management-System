import Table from "@/components/Table";
import { getTeacherAttendances } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import TeacherAttendanceMarkModal from "@/components/TeacherAttendanceMarkModal";

type Row = {
  id: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
  remarks: string;
  teacherId: string;
  teacher: string;
};

const columns = [
  { header: "Teacher", accessor: "teacher" },
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

const TeacherAttendanceListPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const data = await getTeacherAttendances();

  const renderRow = (item: Row) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.teacher}</td>
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
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Teacher Attendance</h1>
        {(role === "admin" || role === "principal") && <TeacherAttendanceMarkModal />}
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
    </div>
  );
};

export default TeacherAttendanceListPage;