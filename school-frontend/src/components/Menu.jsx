import { cookies } from "next/headers";
import MenuLink from "./MenuLink";
import MenuGroup from "./MenuGroup";

// Every role that exists in the backend.
const ALL_ROLES = [
  "admin",
  "teacher",
  "student",
  "parent",
  "principal",
  "accountant",
  "librarian",
  "transport_staff",
];

// Where each role's dashboard lives (same map as middleware.ts).
const ROLE_HOME = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
  principal: "/principal",
  accountant: "/accountant",
  librarian: "/librarian",
  transport_staff: "/transport-staf",
};

// `icon` is an icon NAME (see MenuIcon.tsx), not an image path.
// href "__HOME__" is replaced with the current user's own dashboard.
//
// Each top-level entry is either a plain link ({ href, ... }) or a
// collapsible group ({ children: [...] }).
const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "dashboard",
        label: "Dashboard",
        href: "__HOME__",
        exact: true,
        visible: ALL_ROLES,
      },
      {
        icon: "people",
        label: "People",
        visible: ["admin", "teacher"],
        children: [
          { icon: "teacher", label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
          { icon: "student", label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
          { icon: "parent", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
        ],
      },
      {
        icon: "academics",
        label: "Academics",
        visible: ["admin", "teacher"],
        children: [
          { icon: "subject", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
          { icon: "grade", label: "Grades", href: "/list/grades", visible: ["admin"] },
          { icon: "class", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
          { icon: "lesson", label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
        ],
      },
      {
        icon: "exam",
        label: "Examinations",
        visible: ["admin", "teacher", "student", "parent"],
        children: [
          { icon: "exam", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "assignment", label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "result", label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
        ],
      },
      {
        icon: "attendance",
        label: "Attendance",
        visible: ["admin", "teacher", "student", "parent", "principal", "accountant", "librarian"],
        children: [
          { icon: "attendance", label: "Student Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "attendance", label: "Teacher Attendance", href: "/list/teacher-attendance", visible: ["admin", "principal", "teacher"] },
          { icon: "attendance", label: "Staff Attendance", href: "/list/staff-attendance", visible: ["admin", "principal", "accountant", "librarian"] },
        ],
      },
      // accountant added: the backend already allows ADMIN + ACCOUNTANT on fees.
      { icon: "fees", label: "Fees", href: "/list/fees", visible: ["admin", "accountant", "student", "parent"] },
      // librarian added so the librarian can reach the library from the sidebar.
      { icon: "library", label: "Library", href: "/list/library", visible: ["admin", "librarian", "teacher", "student", "parent"] },
      { icon: "vehicle", label: "Vehicles", href: "/list/vehicles", visible: ["admin", "principal", "transport_staff"] },
      { icon: "leave", label: "Leave", href: "/list/leave", visible: ["admin", "teacher", "principal", "accountant", "librarian", "student", "parent"] },
      {
        icon: "message",
        label: "Communication",
        visible: ["admin", "teacher", "student", "parent"],
        children: [
          { icon: "message", label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "announcement", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "event", label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
        ],
      },
      {
        icon: "admin",
        label: "Administration",
        visible: ["admin"],
        children: [
          { icon: "createStaff", label: "Create Staff", href: "/admin/create-staff", visible: ["admin"] },
          { icon: "audit", label: "Audit Log", href: "/list/audit-logs", visible: ["admin"] },
        ],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "profile", label: "Profile", href: "/profile", visible: ALL_ROLES },
      { icon: "settings", label: "Settings", href: "/settings", visible: ALL_ROLES },
      { icon: "logout", label: "Logout", href: "/logout", action: "logout", visible: ALL_ROLES },
    ],
  },
];

const Menu = () => {
  // Falls back to "admin" only if no session cookie is present yet
  // (e.g. first load before login) so the nav still renders sensibly.
  const role = cookies().get("role")?.value ?? "admin";
  const home = ROLE_HOME[role] ?? "/";

  // Swap the "__HOME__" placeholder for this user's own dashboard URL.
  const resolve = (item) =>
    item.href === "__HOME__" ? { ...item, href: home } : item;

  return (
    <nav className="mt-4 text-sm" aria-label="Main navigation">
      {menuItems.map((section) => {
        // Pre-filter so an empty section (no visible items for this
        // role) doesn't render a bare "MENU"/"OTHER" heading with
        // nothing under it.
        const visibleItems = section.items
          .map((item) => {
            if (item.children) {
              const visibleChildren = item.children.filter((c) => c.visible.includes(role));
              if (visibleChildren.length === 0) return null;
              return { ...item, children: visibleChildren };
            }
            return item.visible.includes(role) ? resolve(item) : null;
          })
          .filter(Boolean);

        if (visibleItems.length === 0) return null;

        return (
          <div className="flex flex-col gap-1" key={section.title}>
            <span className="hidden lg:block text-sidebarSectionLabel text-xs font-semibold tracking-wider uppercase my-4">
              {section.title}
            </span>
            {visibleItems.map((item) =>
              item.children ? (
                <MenuGroup
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  childrenItems={item.children}
                />
              ) : (
                <MenuLink key={item.label} item={item} />
              )
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Menu;