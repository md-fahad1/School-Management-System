import React from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getSubjects } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import SubjectCard from "@/components/SubjectCard";
import { parsePage } from "@/lib/pagination";
const columns = [
  {
    headerKey: "subjectName",
    accessor: "name",
  },
  {
    headerKey: "code",
    accessor: "code",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "type",
    accessor: "type",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "credit",
    accessor: "credit",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "teachers",
    accessor: "teachers",
    className: "hidden md:table-cell",
  },
  {
    headerKey: "actions",
    accessor: "action",
  },
];

const SubjectListPage = async ({ searchParams }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const page = parsePage(searchParams?.page);
  const search = searchParams?.search?.trim() || undefined;
  const { rows: subjectsData, hasNextPage } = await getSubjects(search, page);

  const renderRow = (item) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="flex items-center gap-4 p-4">
        {item.name}
        {(item.isOptional || item.isFourthSubject) && (
          <span className="text-[10px] text-textMuted bg-bg rounded-md px-2 py-1">
            {item.isFourthSubject ? "4th subject" : "Optional"}
          </span>
        )}
      </td>
      <td className="hidden md:table-cell">{item.code}</td>
      <td className="hidden md:table-cell">{item.type}</td>
      <td className="hidden md:table-cell">{item.credit ?? "-"}</td>
      <td className="hidden md:table-cell">{item.teachers.join(",")}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="subject" type="update" data={item} />
              <FormModal table="subject" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <SlidersHorizontal size={14} className="text-textSecondary" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <ArrowUpDown size={14} className="text-textSecondary" />
            </button>
            {role === "admin" && <FormModal table="subject" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <SubjectCard item={item} role={role} />}
        data={subjectsData}
      />
      {/* PAGINATION */}
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default SubjectListPage;
