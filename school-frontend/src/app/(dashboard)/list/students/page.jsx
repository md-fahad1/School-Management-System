import React from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getStudents } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import ExportCsvButton from "@/components/ExportCsvButton";
import ImportCsvButton from "@/components/ImportCsvButton";
import StudentCard from "@/components/StudentCard";
import StudentStatusBadge from "@/components/StudentStatusBadge";
import StudentStatusButton from "@/components/StudentStatusButton";
import StudentStatusFilter from "@/components/StudentStatusFilter";
const columns = [
  { header: "Info", accessor: "info" },
  { header: "Student ID", accessor: "studentId", className: "hidden md:table-cell" },
  { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const StudentListPage = async ({ searchParams }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const search = searchParams?.search ?? undefined;
  const page = Number(searchParams?.page ?? 1) || 1;

  const status = searchParams?.status ?? undefined;

  const { students: studentsData, hasNextPage } = await getStudents(search, page, status);

  const renderRow = (item) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-textMuted">{item.class}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.studentId}</td>
      <td className="hidden md:table-cell">{item.grade}</td>
      <td>
        <StudentStatusBadge status={item.status} />
      </td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-infoLight">
              <Eye size={16} className="text-textSecondary" />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormModal
                table="student"
                type="update"
                data={{
                  id: item.id,
                  name: item.name,
                  phone: item.phone,
                  address: item.address,
                  classId: item.classId,
                  gradeId: item.gradeId,
                  parentId: item.parentId,
                }}
              />
              <StudentStatusButton id={item.id} name={item.name} status={item.status} />
              <FormModal table="student" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="	bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <StudentStatusFilter />
          <div className="flex items-center gap-4 self-end">
  {role === "admin" && (
    <div className="flex flex-wrap items-center gap-2">
      <ImportCsvButton />
      <ExportCsvButton endpoint="students.csv" filename="students.csv" />
      <FormModal table="student" type="create" />
    </div>
  )}
</div>
        </div>
      </div>
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <StudentCard item={item} role={role} />}
        data={studentsData}
      />
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default StudentListPage;