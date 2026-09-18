import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getTeachers } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import ExportCsvButton from "@/components/ExportCsvButton";
import TeacherCard from "@/components/TeacherCard";
type Teacher = {
  id: string;
  teacherId: string;
  name: string;
  email?: string;
  photo: string;
  phone: string;
  subjects: string[];
  subjectIds: string[];
  classes: string[];
  address: string;
};

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Teacher ID", accessor: "teacherId", className: "hidden md:table-cell" },
  { header: "Subjects", accessor: "subjects", className: "hidden md:table-cell" },
  { header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string };
}) => {
  const role = cookies().get("role")?.value ?? "admin";
  const search = searchParams?.search;
  const page = Number(searchParams?.page ?? 1) || 1;

  const { teachers: teachersData, hasNextPage } = await getTeachers(search, page);

  const renderRow = (item: Teacher) => (
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
          <h3 className="font-semibold text-textPrimary">{item.name}</h3>
          <p className="text-xs text-textMuted">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.teacherId}</td>
      <td className="hidden md:table-cell">{item.subjects.join(", ") || "-"}</td>
      <td className="hidden md:table-cell">{item.classes.join(", ") || "-"}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-infoLight">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormModal
                table="teacher"
                type="update"
                data={{
                  id: item.id,
                  name: item.name,
                  phone: item.phone,
                  address: item.address,
                  subjectIds: item.subjectIds,
                }}
              />
              <FormModal table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary text-textPrimary">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-warningLight">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="teacher" type="create" />}
            {role === "admin" && (
              <ExportCsvButton endpoint="teachers.csv" filename="teachers.csv" />
            )}
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <TeacherCard item={item} role={role} />}
        data={teachersData}
      />
      <Pagination page={page} hasNextPage={hasNextPage} />
    </div>
  );
};

export default TeacherListPage;