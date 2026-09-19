import { CalendarRange, Plus } from "lucide-react";
import FormModal from "./FormModal";
import SetCurrentYearButton from "./SetCurrentYearButton";
import { TERM_TYPE_LABEL, fmtDisplayDate, type AcademicYearItem } from "@/lib/academic";

const AcademicYearCard = ({ year }: { year: AcademicYearItem }) => {
  return (
    <section className="bg-cardBg border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-accentLight flex items-center justify-center shrink-0">
            <CalendarRange size={20} className="text-accent" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-textPrimary text-base">{year.name}</h3>
              {year.isCurrent && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-successLight text-success">
                  Current
                </span>
              )}
            </div>
            <p className="text-sm text-textMuted">
              {fmtDisplayDate(year.startDate)} – {fmtDisplayDate(year.endDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!year.isCurrent && <SetCurrentYearButton id={year.id} name={year.name} />}
          <FormModal table="academicYear" type="update" data={year} />
          {/* Backend refuses to delete the current year, so don't offer it. */}
          {!year.isCurrent && <FormModal table="academicYear" type="delete" id={year.id} itemName={year.name} />}
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="text-sm font-semibold text-textPrimary">
            Terms &amp; semesters <span className="text-textMuted font-normal">({year.terms.length})</span>
          </h4>
          <FormModal
            table="term"
            type="create"
            data={{ academicYearId: year.id, yearName: year.name, yearStart: year.startDate, yearEnd: year.endDate }}
            trigger={<><Plus size={14} /> Add term</>}
            triggerClassName="btn-secondary !py-1.5 !px-3"
          />
        </div>

        {year.terms.length === 0 ? (
          <p className="text-sm text-textMuted py-2">No terms yet. Add the semesters or terms that make up this year.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {year.terms.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-textPrimary truncate">
                    {t.name}{" "}
                    <span className="ml-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-infoLight text-info">
                      {TERM_TYPE_LABEL[t.type] ?? t.type}
                    </span>
                  </p>
                  <p className="text-xs text-textMuted">
                    {fmtDisplayDate(t.startDate)} – {fmtDisplayDate(t.endDate)}
                  </p>
                </div>
                <FormModal table="term" type="delete" id={t.id} itemName={t.name} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AcademicYearCard;