import Table from "@/components/Table";
import { getLeaves } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import LeaveApplyModal from "@/components/LeaveApplyModal";
import LeaveDecideButtons from "@/components/LeaveDecideButtons";

type Row = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  applicantId: string;
  applicant: string;
  applicantRole: string;
  approvedBy: string;
};

const columns = [
  { header: "Applicant", accessor: "applicant" },
  { header: "Type", accessor: "leaveType" },
  { header: "From", accessor: "startDate" },
  { header: "To", accessor: "endDate" },
  { header: "Reason", accessor: "reason", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Actions", accessor: "action" },
];

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const LeaveListPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const myId = cookies().get("userId")?.value;
  const canDecide = role === "admin" || role === "principal";
  const data = await getLeaves();

  const renderRow = (item: Row) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.applicant}{" "}
        <span className="text-xs text-gray-400">({item.applicantRole})</span>
      </td>
      <td>{item.leaveType}</td>
      <td>{item.startDate}</td>
      <td>{item.endDate}</td>
      <td className="hidden md:table-cell">{item.reason}</td>
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
        <LeaveDecideButtons
          id={item.id}
          status={item.status}
          canDecide={canDecide}
          isOwn={item.applicantId === myId}
        />
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Leave Requests</h1>
        <LeaveApplyModal />
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
    </div>
  );
};

export default LeaveListPage;