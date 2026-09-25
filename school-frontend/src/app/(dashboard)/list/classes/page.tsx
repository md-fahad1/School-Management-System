import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getClasses } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import ClassCard from "@/components/ClassCard";
import { parsePage, type ListSearchParams } from "@/lib/pagination";
type Class = {
  id: string;
  name: string;
  capacity: number;
  section?: string;
  room?: string;
  grade: number | string;
  supervisor: string;
  department?: string;
};

const columns = [
  {
    headerKey: "classLabel",
    accessor: "name",
  },
  {
    headerKey: "section",
    accessor: "section",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "room",
    accessor: "room",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "supervisor",
    accessor: "supervisor",
    className: "hidden md:table-cell",
  },
    {
    headerKey: "department",
    accessor: "department",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "actions",
    accessor: "action",
  },
];

const ClassListPage = async ({ searchParams }: { searchParams?: ListSearchParams }) => {
  const role = cookies().get("role")?.value ?? "admin";
    const page = parsePage(searchParams?.page);
  const search = searchParams?.search?.trim() || undefined;
  const { rows: classesData, hasNextPage } = await getClasses(search, page);


  const renderRow = (item: Class) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">{item.section ?? "-"}</td>
      <td className="hidden md:table-cell">{item.room ?? "-"}</td>
      <td className="hidden md:table-cell">{item.capacity}</td>
      <td className="hidden md:table-cell">{item.grade}</td>
      <td className="hidden md:table-cell">{item.supervisor}</td>
            <td className="hidden md:table-cell">{item.department ?? "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="class" type="update" data={item} />
              <FormModal table="class" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
                            <SlidersHorizontal size={14} className="text-textSecondary" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
                           <ArrowUpDown size={14} className="text-textSecondary" />
            </button>
            {role === "admin" && <FormModal table="class" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <ClassCard item={item} role={role} />}
        data={classesData}
      />
      {/* PAGINATION */}
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default ClassListPage;
