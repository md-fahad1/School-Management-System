import { cookies } from "next/headers";
import MenuLink from "./MenuLink";

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.png", label: "Dashboard", href: "/admin", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
      { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
      { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
      { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: "/setting.png", label: "Create Staff", href: "/admin/create-staff", visible: ["admin"] },
      { icon: "/subject.png", label: "Library", href: "/list/library", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/finance.png", label: "Fees", href: "/list/fees", visible: ["admin", "student", "parent"] },
      { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
      { icon: "/lesson.png", label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
      { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/assignment.png", label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/result.png", label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/attendance.png", label: "Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/attendance.png", label: "Teacher Attendance", href: "/list/teacher-attendance", visible: ["admin", "principal", "teacher"] },
      { icon: "/attendance.png", label: "Staff Attendance", href: "/list/staff-attendance", visible: ["admin", "principal", "accountant", "librarian"] },
      { icon: "/calendar.png", label: "Leave", href: "/list/leave", visible: ["admin", "teacher", "principal", "accountant", "librarian", "student", "parent"] },
      { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/message.png", label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
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
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (!item.visible.includes(role)) return null;
            return <MenuLink key={item.label} item={item} />;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;