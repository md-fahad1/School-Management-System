import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getParents } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import ParentCard from "@/components/ParentCard";
type Parent = {
  id: string;
  name: string;
  email?: string;
  students: string[];
  phone: string;
  address: string;
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student Names",
    accessor: "students",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ParentListPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const parentsData = await getParents();

  const renderRow = (item: Parent) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-textMuted">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.students.join(",")}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="parent" type="update" data={item} />
              <FormModal table="parent" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="	bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <SlidersHorizontal size={14} className="text-textSecondary" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <ArrowUpDown size={14} className="text-textSecondary" />
            </button>
            {role === "admin" && (
              <FormModal table="parent" type="create"/>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <ParentCard item={item} role={role} />}
        data={parentsData}
      />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ParentListPage;
