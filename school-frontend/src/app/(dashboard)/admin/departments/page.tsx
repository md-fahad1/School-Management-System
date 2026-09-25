import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import DepartmentCard from "@/components/DepartmentCard";
import { getDepartments } from "@/lib/graphql/fetchers";
import { DEPARTMENT_TYPE_LABEL, type DepartmentItem } from "@/lib/academic";

const columns = [
  { headerKey: "name", accessor: "name" },
  { headerKey: "code", accessor: "code", className: "hidden md:table-cell" },
  { headerKey: "type", accessor: "type", className: "hidden md:table-cell" },
  { headerKey: "classes", accessor: "classCount", className: "hidden md:table-cell" },
  { headerKey: "actions", accessor: "action" },
];

const DepartmentsPage = async ({ searchParams }: { searchParams?: { search?: string } }) => {
  const search = searchParams?.search?.trim() || undefined;
  const departments = await getDepartments(search);

  const renderRow = (item: DepartmentItem) => (
    <tr key={item.id} className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors">
      <td className="p-4">
        <p className="font-medium text-textPrimary">{item.name}</p>
        {item.description && <p className="text-xs text-textMuted line-clamp-1">{item.description}</p>}
      </td>
      <td className="hidden md:table-cell">{item.code ?? "-"}</td>
      <td className="hidden md:table-cell">{DEPARTMENT_TYPE_LABEL[item.type] ?? item.type}</td>
      <td className="hidden md:table-cell">{item.classCount}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormModal table="department" type="update" data={item} />
          <FormModal table="department" type="delete" id={item.id} itemName={item.name} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-textPrimary">Departments &amp; Groups</h1>
          <p className="text-sm text-textMuted">
            Schools use groups (Science, Humanities). Colleges use departments (CSE, Physics).
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FormModal table="department" type="create" />
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <DepartmentCard item={item} />}
        data={departments}
      />
    </div>
  );
};

export default DepartmentsPage;