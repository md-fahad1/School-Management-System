import FormModal from "@/components/FormModal";
import AcademicYearCard from "@/components/AcademicYearCard";
import { getAcademicYears } from "@/lib/graphql/fetchers";

const AcademicYearsPage = async () => {
  const years = await getAcademicYears();
  const current = years.find((y) => y.isCurrent);

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-textPrimary">Academic Years</h1>
          <p className="text-sm text-textMuted">
            {current
              ? `Current year: ${current.name}. Add terms or semesters inside each year.`
              : "Set up the year your school is running in, then add its terms or semesters."}
          </p>
        </div>
        <FormModal table="academicYear" type="create" />
      </div>

      {years.length === 0 ? (
        <div className="mt-6 border border-dashed border-border rounded-2xl p-8 text-center">
          <p className="font-medium text-textPrimary">No academic years yet</p>
          <p className="text-sm text-textMuted mt-1 mb-4">
            This is the first step of setting up a new school. Create your first academic year to begin.
          </p>
          <div className="inline-block">
            <FormModal table="academicYear" type="create" />
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {years.map((y) => (
            <AcademicYearCard key={y.id} year={y} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AcademicYearsPage;