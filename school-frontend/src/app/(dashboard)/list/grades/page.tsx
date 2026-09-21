import React from "react";
import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { getGrades } from "@/lib/graphql/fetchers";
import { cookies } from "next/headers";
import GradeCard from "@/components/GradeCard";
const columns = [
  {
    header: "Grade Level",
    accessor: "level",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const GradeListPage = async () => {
  const role = cookies().get("role")?.value ?? "admin";
  const gradesData = await getGrades();

  const renderRow = (item: { id: string; level: number }) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-bg/50 text-sm hover:bg-accentLight transition-colors"
    >
      <td className="flex items-center gap-4 p-4">Grade {item.level}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="grade" type="update" data={item} />
              <FormModal table="grade" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold text-textPrimary">All Grades</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && <FormModal table="grade" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table
        columns={columns}
        renderRow={renderRow}
        renderCard={(item) => <GradeCard item={item} role={role} />}
        data={gradesData}
      />
      {/* PAGINATION */}
    </div>
  );
};

export default GradeListPage;