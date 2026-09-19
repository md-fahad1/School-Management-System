"use client";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRound,
  BookOpen,
  Layers,
  School,
  NotebookText,
  ClipboardList,
  FileText,
  Award,
  CalendarCheck,
  Wallet,
  Library,
  Bus,
  CalendarClock,
  MessageSquare,
  Megaphone,
  CalendarDays,
  ShieldCheck,
  UserPlus,
  ScrollText,
  User,
  Settings,
  LogOut,
    LifeBuoy,
  type LucideIcon,
} from "lucide-react";

// Menu.jsx is a Server Component and can't pass component functions to
// client components, so it passes an icon *name*; this maps it to the icon.
const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  people: Users,
  teacher: Users,
  student: GraduationCap,
  parent: UserRound,
  academics: BookOpen,
  subject: BookOpen,
  grade: Layers,
  class: School,
  lesson: NotebookText,
  exam: ClipboardList,
  assignment: FileText,
  result: Award,
  attendance: CalendarCheck,
  fees: Wallet,
  library: Library,
  vehicle: Bus,
  leave: CalendarClock,
  message: MessageSquare,
  announcement: Megaphone,
  event: CalendarDays,
  admin: ShieldCheck,
  createStaff: UserPlus,
  audit: ScrollText,
  profile: User,
  settings: Settings,
  logout: LogOut,
   help: LifeBuoy,
};

const MenuIcon = ({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) => {
  const Icon = icons[name] ?? LayoutDashboard;
  return <Icon size={size} className={className} aria-hidden="true" />;
};

export default MenuIcon;