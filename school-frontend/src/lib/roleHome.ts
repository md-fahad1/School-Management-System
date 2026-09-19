// One place that maps a role to its dashboard path.
export const ROLE_HOME: Record<string, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
  librarian: "/librarian",
  accountant: "/accountant",
  principal: "/principal",
  transport_staff: "/transport-staf",
};

export function roleHome(role: string): string {
  return ROLE_HOME[role.toLowerCase()] ?? "/signin";
}