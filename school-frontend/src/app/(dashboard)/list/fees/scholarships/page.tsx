import Table from "@/components/Table";
import ScholarshipModal from "@/components/ScholarshipModal";
import DeactivateScholarshipButton from "@/components/DeactivateScholarshipButton";
import { getScholarships } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Link from "next/link";
import ScholarshipCard from "@/components/ScholarshipCard";
type Scholarship = {
  id: string;
  name: string;
  type: string;
  value: number;
  active: boolean;
  startDate: string;
  endDate: string | null;
  studentName: string;
};

const columns = [
  { headerKey: "student", accessor: "studentName" },
  { headerKey: "scholarship", accessor: "name" },
  { headerKey: "type", accessor: "type", className: "hidden md:table-cell" },
  { headerKey: "value", accessor: "value" },
  { headerKey: "period", accessor: "period", className: "hidden lg:table-cell" },
  { headerKey: "status", accessor: "active" },
  { headerKey: "actions", accessor: "action" },
];

const ScholarshipsPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const canManage = role === "admin" || role === "accountant";
  const scholarships = await getScholarships();

  const renderRow = (item: Scholarship) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="p-4">
        <h3 className="font-semibold">{item.studentName}</h3>
      </td>
      <td>{item.name}</td>
      <td className="hidden md:table-cell">{item.type}</td>
      <td>{item.type === "PERCENTAGE" ? `${item.value}%` : `$${item.value.toFixed(2)}`}</td>
      <td className="hidden lg:table-cell">
        {item.startDate} {item.endDate ? `– ${item.endDate}` : "(ongoing)"}
      </td>
      <td className={item.active ? "text-green-600" : "text-gray-400"}>
        {item.active ? "Active" : "Inactive"}
      </td>
      <td>{canManage && <DeactivateScholarshipButton id={item.id} active={item.active} />}</td>
    </tr>
  );

  return (
    <div className="	bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">Scholarships</h1>
        <div className="flex items-center gap-4">
          <Link href="/list/fees/invoices">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-infoLight text-xs">
              Invoices
            </button>
          </Link>
          {canManage && <ScholarshipModal />}
        </div>
      </div>
            <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <ScholarshipCard item={item} canManage={canManage} />}
        data={scholarships}
      />
    </div>
  );
};

export default ScholarshipsPage;