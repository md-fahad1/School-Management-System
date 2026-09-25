import { cookies } from "next/headers";
import MenuLink from "./MenuLink";
import MenuGroup from "./MenuGroup";
import MenuSectionTitle from "./MenuSectionTitle";
import { getMyPermissions } from "@/lib/graphql/fetchers";

// Every role that exists in the backend.
const ALL_ROLES = [
  "super_admin",
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
  super_admin: "/super-admin",
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
// `labelKey` is a translation key under the "menu" namespace (see
// lib/i18n/translations.ts) — MenuLink/MenuGroup translate it at render time.
// href "__HOME__" is replaced with the current user's own dashboard.
//
// Each top-level entry is either a plain link ({ href, ... }) or a
// collapsible group ({ children: [...] }).
const menuItems = [
  {
    titleKey: "menuTitle",
    items: [
      {
        icon: "dashboard",
        labelKey: "dashboard",
        href: "__HOME__",
        exact: true,
        visible: ALL_ROLES,
      },
      {
        icon: "people",
        labelKey: "people",
        visible: ["admin", "teacher", "principal"],
        children: [
          { icon: "teacher", labelKey: "teachers", href: "/list/teachers", visible: ["admin", "teacher", "principal"] },
          { icon: "student", labelKey: "students", href: "/list/students", visible: ["admin", "teacher", "principal"] },
          { icon: "parent", labelKey: "parents", href: "/list/parents", visible: ["admin", "teacher", "principal"] },
        ],
      },
      {
        icon: "academics",
        labelKey: "academics",
        visible: ["admin", "teacher", "principal"],
        children: [
          { icon: "calendar", labelKey: "academicYears", href: "/admin/academic-years", visible: ["admin"] },
          { icon: "department", labelKey: "departments", href: "/admin/departments", visible: ["admin"] },
          { icon: "subject", labelKey: "subjects", href: "/list/subjects", visible: ["admin", "principal"] },
          { icon: "grade", labelKey: "grades", href: "/list/grades", visible: ["admin", "principal"] },
          { icon: "class", labelKey: "classes", href: "/list/classes", visible: ["admin", "teacher", "principal"] },
          { icon: "lesson", labelKey: "lessons", href: "/list/lessons", visible: ["admin", "teacher", "principal"] },
        ],
      },
      {
        icon: "exam",
        labelKey: "examinations",
        visible: ["admin", "teacher", "student", "parent", "principal"],
        children: [
          { icon: "exam", labelKey: "exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent", "principal"] },
          { icon: "assignment", labelKey: "assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent", "principal"] },
          { icon: "result", labelKey: "results", href: "/list/results", visible: ["admin", "teacher", "student", "parent", "principal"] },
        ],
      },
      {
        icon: "attendance",
        labelKey: "attendance",
        visible: ["admin", "teacher", "student", "parent", "principal", "accountant", "librarian"],
        children: [
          { icon: "attendance", labelKey: "studentAttendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "attendance", labelKey: "teacherAttendance", href: "/list/teacher-attendance", visible: ["admin", "principal", "teacher"] },
          { icon: "attendance", labelKey: "staffAttendance", href: "/list/staff-attendance", visible: ["admin", "principal", "accountant", "librarian"] },
        ],
      },
      // accountant added: the backend already allows ADMIN + ACCOUNTANT on fees.
      { icon: "fees", labelKey: "fees", href: "/list/fees", visible: ["admin", "accountant", "student", "parent", "principal"] },
      // librarian added so the librarian can reach the library from the sidebar.
      { icon: "library", labelKey: "library", href: "/list/library", visible: ["admin", "librarian", "teacher", "student", "parent"] },
      { icon: "vehicle", labelKey: "vehicles", href: "/list/vehicles", visible: ["admin", "principal", "transport_staff"] },
      { icon: "vehicle", labelKey: "routes", href: "/list/routes", visible: ["admin", "principal", "transport_staff"] },
      { icon: "leave", labelKey: "leave", href: "/list/leave", visible: ["admin", "teacher", "principal", "accountant", "librarian", "student", "parent"] },
      {
        icon: "message",
        labelKey: "communication",
        visible: ["admin", "teacher", "student", "parent"],
        children: [
          { icon: "message", labelKey: "messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "announcement", labelKey: "announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "event", labelKey: "events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
        ],
      },
      {
        icon: "admin",
        labelKey: "administration",
        visible: ["admin"],
        children: [
          { icon: "createStaff", labelKey: "createStaff", href: "/admin/create-staff", visible: ["admin"] },
          { icon: "settings", labelKey: "institution", href: "/admin/institution", visible: ["admin"] },
          { icon: "audit", labelKey: "auditLog", href: "/list/audit-logs", visible: ["admin"] },
          { icon: "roles", labelKey: "rolesPermissions", href: "/admin/roles", visible: ["admin"] },
          { icon: "roles", labelKey: "userAccess", href: "/admin/users", visible: ["admin"] },
        ],
      },
    ],
  },
  {
    titleKey: "otherTitle",
    items: [
      { icon: "profile", labelKey: "profile", href: "/profile", visible: ALL_ROLES },
      { icon: "settings", labelKey: "settings", href: "/settings", visible: ALL_ROLES },
      { icon: "help", labelKey: "help", href: "/help", visible: ALL_ROLES },
      { icon: "logout", labelKey: "logout", href: "/logout", action: "logout", visible: ALL_ROLES },
    ],
  },
];

// Permission each sidebar link needs, matched by href. Links not listed here
// (Dashboard, Profile, ...) are shown to every role that can see them.
// "Teachers" is left out on purpose: the built-in teacher role has never had
// teacher:view, but has always seen that page.
const LINK_PERMISSION = {
  "/list/students": "student:view",
  "/list/parents": "parent:view",
  "/list/subjects": "subject:view",
  "/list/classes": "class:view",
  "/list/lessons": "lesson:view",
  "/list/exams": "exam:view",
  "/list/assignments": "assignment:view",
  "/list/results": "result:view",
  "/list/attendance": "attendance:view",
  "/list/fees": "fee:view",
  "/list/library": "book:view",
  "/list/vehicles": "transport:view",
  "/list/routes": "transport:view",
  "/list/leave": "leave:view",
  "/list/messages": "message:view",
  "/list/announcements": "announcement:view",
  "/list/events": "event:view",
  "/admin/create-staff": "user:create",
  "/list/audit-logs": "audit:view",
  "/admin/roles": "role:manage",
  "/admin/users": "role:manage",
};

const Menu = async () => {
  // Falls back to "admin" only if no session cookie is present yet
  // (e.g. first load before login) so the nav still renders sensibly.
  const role = cookies().get("role")?.value ?? "admin";
  const home = ROLE_HOME[role] ?? "/";

  // If permissions cannot be loaded we show everything the role can see.
  // This only decides what is displayed; the backend enforces access.
  const permissions = await getMyPermissions();
  const canSee = (item) => {
    if (!item.visible.includes(role)) return false;
    const needed = LINK_PERMISSION[item.href];
    return !needed || !permissions || permissions.includes(needed);
  };

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
              const visibleChildren = item.children.filter((c) => canSee(c));
              if (visibleChildren.length === 0) return null;
              return { ...item, children: visibleChildren.map(resolve) };
            }
            return canSee(item) ? resolve(item) : null;
          })
          .filter(Boolean);

        if (visibleItems.length === 0) return null;

        return (
          <div className="flex flex-col gap-1" key={section.titleKey}>
            <MenuSectionTitle titleKey={section.titleKey} />
            {visibleItems.map((item) =>
              item.children ? (
                <MenuGroup
                  key={item.labelKey}
                  icon={item.icon}
                  labelKey={item.labelKey}
                  childrenItems={item.children}
                />
              ) : (
                <MenuLink key={item.labelKey} item={item} />
              )
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Menu;