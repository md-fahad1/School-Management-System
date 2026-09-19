// Small helpers shared by the Roles pages (safe to import from server AND client files).

/** "TRANSPORT_STAFF" -> "Transport Staff" */
export function prettyRoleName(name: string): string {
  return name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "staffAttendance" -> "Staff Attendance", "bookLoan" -> "Book Loan" */
export function prettyModule(module: string): string {
  return module
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}