import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getLessons } from "@/lib/graphql/fetchers";
import { parsePage, type ListSearchParams } from "@/lib/pagination";
import { cookies } from "next/headers";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import LessonCard from "@/components/LessonCard";
type Lesson = {
  id: string;
  subject: string;
  class: string;
  teacher: string;
};

const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const LessonListPage = async ({ searchParams }: { searchParams?: ListSearchParams }) => {
  const role = cookies().get("role")?.value ?? "admin";
  const page = parsePage(searchParams?.page);
  const { rows: lessonsData, hasNextPage } = await getLessons(page);

  const renderRow = (item: Lesson) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="flex items-center gap-4 p-4">{item.subject}</td>
      <td>{item.class}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="lesson" type="update" data={item} />
              <FormModal table="lesson" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <SlidersHorizontal size={14} className="text-textSecondary" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <ArrowUpDown size={14} className="text-textSecondary" />
            </button>
            {role === "admin" && <FormModal table="lesson" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <LessonCard item={item} role={role} />}
        data={lessonsData}
      />
      {/* PAGINATION */}
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default LessonListPage;