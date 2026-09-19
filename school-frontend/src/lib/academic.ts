export type TermType = "TERM" | "SEMESTER" | "TRIMESTER";
export type DepartmentType = "GROUP" | "DEPARTMENT";

export type TermItem = {
  id: string;
  name: string;
  type: TermType;
  startDate: string;
  endDate: string;
  academicYearId: string;
};

export type AcademicYearItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: TermItem[];
};

export type DepartmentItem = {
  id: string;
  name: string;
  code: string | null;
  type: DepartmentType;
  description: string | null;
  classCount: number;
};

export const TERM_TYPE_LABEL: Record<TermType, string> = {
  TERM: "Term",
  SEMESTER: "Semester",
  TRIMESTER: "Trimester",
};

export const DEPARTMENT_TYPE_LABEL: Record<DepartmentType, string> = {
  GROUP: "Group",
  DEPARTMENT: "Department",
};

// Backend stores UTC midnight, so format in UTC to avoid off-by-one days.
export function fmtDisplayDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function toInputDate(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}