export const STUDENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "TRANSFERRED",
  "GRADUATED",
  "ALUMNI",
  "DROPPED",
  "EXPELLED",
] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const STATUS_LABEL: Record<StudentStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
  TRANSFERRED: "Transferred",
  GRADUATED: "Graduated",
  ALUMNI: "Alumni",
  DROPPED: "Dropped out",
  EXPELLED: "Expelled",
};