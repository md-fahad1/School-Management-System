import { cookies } from "next/headers";
import MenuLink from "./MenuLink";
import MenuGroup from "./MenuGroup";

// Each top-level entry is either a plain link ({ href, ... }) or a
// collapsible group ({ children: [...] }) — grouping keeps the sidebar
// short instead of listing every page flat, and each group only opens
// when the user clicks it (or is already on one of its pages).
const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Dashboard",
        href: "/admin",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "People",
        visible: ["admin", "teacher"],
        children: [
          { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
          { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
          { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
        ],
      },
      {
        icon: "/subject.png",
        label: "Academics",
        visible: ["admin", "teacher"],
        children: [
          { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
          { icon: "/subject.png", label: "Grades", href: "/list/grades", visible: ["admin"] },
          { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
          { icon: "/lesson.png", label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
        ],
      },
      {
        icon: "/exam.png",
        label: "Examinations",
        visible: ["admin", "teacher", "student", "parent"],
        children: [
          { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "/assignment.png", label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "/result.png", label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
        ],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        visible: ["admin", "teacher", "student", "parent", "principal", "accountant", "librarian"],
        children: [
          { icon: "/attendance.png", label: "Student Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "/attendance.png", label: "Teacher Attendance", href: "/list/teacher-attendance", visible: ["admin", "principal", "teacher"] },
          { icon: "/attendance.png", label: "Staff Attendance", href: "/list/staff-attendance", visible: ["admin", "principal", "accountant", "librarian"] },
        ],
      },
      { icon: "/finance.png", label: "Fees", href: "/list/fees", visible: ["admin", "student", "parent"] },
      { icon: "/subject.png", label: "Library", href: "/list/library", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/setting.png", label: "Vehicles", href: "/list/vehicles", visible: ["admin", "principal", "transport_staff"] },
      { icon: "/calendar.png", label: "Leave", href: "/list/leave", visible: ["admin", "teacher", "principal", "accountant", "librarian", "student", "parent"] },
      {
        icon: "/message.png",
        label: "Communication",
        visible: ["admin", "teacher", "student", "parent"],
        children: [
          { icon: "/message.png", label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
          { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
        ],
      },
      {
        icon: "/setting.png",
        label: "Administration",
        visible: ["admin"],
        children: [
          { icon: "/setting.png", label: "Create Staff", href: "/admin/create-staff", visible: ["admin"] },
          { icon: "/setting.png", label: "Audit Log", href: "/list/audit-logs", visible: ["admin"] },
        ],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/logout.png", label: "Logout", href: "/logout", action: "logout", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
];

const Menu = () => {
  // Falls back to "admin" only if no session cookie is present yet
  // (e.g. first load before login) so the nav still renders sensibly.
  const role = cookies().get("role")?.value ?? "admin";

  return (
    <div className="mt-4 text-sm">
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
            return item.visible.includes(role) ? item : null;
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
    </div>
  );
};

export default Menu;