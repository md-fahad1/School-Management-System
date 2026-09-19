import Link from "next/link";
import { cookies } from "next/headers";
import { LifeBuoy, ChevronDown, ArrowRight } from "lucide-react";

type Topic = {
  q: string;
  steps: string[];
  link?: { href: string; label: string };
};

const COMMON: Topic[] = [
  {
    q: "How do I change my password?",
    steps: [
      "Open Settings from the left menu.",
      "Scroll to “Change password”.",
      "Type your current password, then your new one, and save.",
    ],
    link: { href: "/settings", label: "Open Settings" },
  },
  {
    q: "I forgot my password",
    steps: [
      "On the sign-in page, click “Forgot password?”.",
      "Enter your email address.",
      "Open the email we send you and follow the link to choose a new password.",
    ],
  },
  {
    q: "How do I change my profile photo?",
    steps: ["Open Profile from the left menu.", "Click your photo and pick a new picture."],
    link: { href: "/profile", label: "Open Profile" },
  },
];

const BY_ROLE: Record<string, { label: string; topics: Topic[] }> = {
  admin: {
    label: "Admin",
    topics: [
      {
        q: "How do I set up a new school?",
        steps: [
          "Grades — Academics → Grades (for example Grade 1 to Grade 10).",
          "Classes — Academics → Classes (for example Class 5-A).",
          "Subjects — Academics → Subjects.",
          "Teachers — People → Teachers.",
          "Parents, then Students — People → Parents, then People → Students.",
          "Lessons — Academics → Lessons, to put a subject, class and teacher on a weekday.",
        ],
      },
      {
        q: "How do I add a student?",
        steps: [
          "Add the student's parent first: People → Parents → Add Parent.",
          "Go to People → Students and click “Add Student”.",
          "Fill in the details, then choose the class, grade and parent from the lists.",
        ],
        link: { href: "/list/students", label: "Go to Students" },
      },
      {
        q: "How do I add many students at once?",
        steps: [
          "Go to Students and click “Import CSV”.",
          "Click “Download template” and open it in Excel or Google Sheets.",
          "Type one student per row. Write the class name, grade number and the parent's email — no IDs needed.",
          "Save as CSV, click “Choose CSV file”, check the summary, then click Import.",
        ],
        link: { href: "/list/students", label: "Go to Students" },
      },
      {
        q: "How do I post an announcement?",
        steps: [
          "Use “Post announcement” in Quick actions on your dashboard,",
          "or open Communication → Announcements and click “Add Announcement”.",
        ],
        link: { href: "/list/announcements", label: "Go to Announcements" },
      },
      {
        q: "How do I create an account for an accountant, librarian or principal?",
        steps: [
          "Open Administration → Create Staff.",
          "Pick the role, fill in the details and give a temporary password.",
          "Tell the person to sign in and change the password in Settings.",
        ],
        link: { href: "/admin/create-staff", label: "Go to Create Staff" },
      },
      {
        q: "How do I see who changed something?",
        steps: ["Open Administration → Audit Log.", "Every create, edit and delete is listed with who did it and when."],
        link: { href: "/list/audit-logs", label: "Open Audit Log" },
      },
    ],
  },
  teacher: {
    label: "Teacher",
    topics: [
      {
        q: "How do I take attendance?",
        steps: ["Open Attendance → Student Attendance.", "Click “Add Attendance record”, choose the student and lesson, and save."],
        link: { href: "/list/attendance", label: "Go to Attendance" },
      },
      {
        q: "How do I create an assignment?",
        steps: ["Open Examinations → Assignments.", "Click “Add Assignment”, choose the lesson, write the details and set a due date."],
        link: { href: "/list/assignments", label: "Go to Assignments" },
      },
      {
        q: "How do I enter exam marks?",
        steps: ["Open Examinations → Results.", "Click “Add Result”, choose the student and exam, and type the score."],
        link: { href: "/list/results", label: "Go to Results" },
      },
      {
        q: "Where is my timetable?",
        steps: ["Your dashboard shows your weekly schedule in a calendar."],
      },
      {
        q: "How do I apply for leave?",
        steps: ["Open Leave and click “Apply for Leave”.", "Choose the dates, write a reason and send it. You can see when it is approved."],
        link: { href: "/list/leave", label: "Go to Leave" },
      },
    ],
  },
  student: {
    label: "Student",
    topics: [
      { q: "Where is my class schedule?", steps: ["Your dashboard shows your weekly schedule in a calendar."] },
      {
        q: "How do I see my assignments, exams and results?",
        steps: ["Open Examinations in the left menu.", "Choose Assignments, Exams or Results."],
        link: { href: "/list/results", label: "See my results" },
      },
      {
        q: "How do I check my attendance?",
        steps: ["Open Attendance → Student Attendance to see the days you were present or absent."],
        link: { href: "/list/attendance", label: "Go to Attendance" },
      },
      {
        q: "How do I see my fees?",
        steps: ["Open Fees to see your invoices and what has been paid."],
        link: { href: "/list/fees", label: "Go to Fees" },
      },
    ],
  },
  parent: {
    label: "Parent",
    topics: [
      {
        q: "How do I see my child's results?",
        steps: ["Open Examinations → Results.", "You will see the marks for your child."],
        link: { href: "/list/results", label: "See results" },
      },
      {
        q: "How do I check my child's attendance?",
        steps: ["Open Attendance → Student Attendance."],
        link: { href: "/list/attendance", label: "Go to Attendance" },
      },
      {
        q: "How do I see fees and invoices?",
        steps: ["Open Fees to see invoices, what has been paid and what is still due."],
        link: { href: "/list/fees", label: "Go to Fees" },
      },
      {
        q: "How do I message a teacher?",
        steps: ["Open Communication → Messages.", "Click “New”, choose the teacher and write your message."],
        link: { href: "/list/messages", label: "Go to Messages" },
      },
    ],
  },
  accountant: {
    label: "Accountant",
    topics: [
      {
        q: "How do I create and send invoices?",
        steps: ["Open Fees → Invoices.", "Click “Generate Invoice”, choose the student and fee, and confirm."],
        link: { href: "/list/fees/invoices", label: "Go to Invoices" },
      },
      {
        q: "How do I record a payment?",
        steps: ["Open Fees → Invoices.", "Find the invoice and use its payment option, then enter the amount received."],
        link: { href: "/list/fees/invoices", label: "Go to Invoices" },
      },
      {
        q: "How do I mark my own attendance?",
        steps: ["Open Attendance → Staff Attendance."],
        link: { href: "/list/staff-attendance", label: "Go to Staff Attendance" },
      },
    ],
  },
  librarian: {
    label: "Librarian",
    topics: [
      {
        q: "How do I find a book?",
        steps: ["Open Library and use the search box at the top of the list."],
        link: { href: "/list/library", label: "Go to Library" },
      },
      {
        q: "How do I see who borrowed a book?",
        steps: ["Open Library, then the Loans page."],
        link: { href: "/list/library/loans", label: "Go to Loans" },
      },
      {
        q: "How do I mark my own attendance?",
        steps: ["Open Attendance → Staff Attendance."],
        link: { href: "/list/staff-attendance", label: "Go to Staff Attendance" },
      },
    ],
  },
  principal: {
    label: "Principal",
    topics: [
      { q: "Where can I see the school overview?", steps: ["Your dashboard shows totals, attendance and the calendar."] },
      {
        q: "How do I review leave requests?",
        steps: ["Open Leave.", "Choose Approve or Reject on a pending request."],
        link: { href: "/list/leave", label: "Go to Leave" },
      },
      {
        q: "How do I check teacher attendance?",
        steps: ["Open Attendance → Teacher Attendance."],
        link: { href: "/list/teacher-attendance", label: "Go to Teacher Attendance" },
      },
    ],
  },
  transport_staff: {
    label: "Transport staff",
    topics: [
      { q: "Where are my vehicles?", steps: ["Your dashboard lists the vehicles assigned to you.", "You can also open Vehicles in the left menu."], link: { href: "/list/vehicles", label: "Go to Vehicles" } },
      {
        q: "How do I apply for leave?",
        steps: ["Open Leave and click “Apply for Leave”.", "Choose the dates, write a reason and send it."],
        link: { href: "/list/leave", label: "Go to Leave" },
      },
    ],
  },
};

const TopicCard = ({ topic }: { topic: Topic }) => (
  <details className="group rounded-xl border border-border bg-cardBg shadow-sm open:border-accent/40">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium text-textPrimary [&::-webkit-details-marker]:hidden">
      {topic.q}
      <ChevronDown
        size={18}
        className="shrink-0 text-textMuted transition-transform group-open:rotate-180"
        aria-hidden="true"
      />
    </summary>
    <div className="border-t border-border px-4 pb-4 pt-3">
      <ol className="flex flex-col gap-2.5">
        {topic.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-textSecondary">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accentLight text-xs font-semibold text-accent">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {topic.link && (
        <Link
          href={topic.link.href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {topic.link.label}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  </details>
);

const HelpPage = () => {
  const role = cookies().get("role")?.value ?? "";
  const section = BY_ROLE[role];

  return (
    <div className="m-4 mt-0 flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-cardBg p-5 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-infoLight text-info">
          <LifeBuoy size={24} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-textPrimary">Help &amp; guides</h1>
          <p className="text-sm text-textSecondary">
            Simple step-by-step answers{section ? ` for ${section.label.toLowerCase()}s` : ""}. Tap a question to open it.
          </p>
        </div>
      </div>

      {section && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-textSecondary">
            Things you can do
          </h2>
          {section.topics.map((t) => (
            <TopicCard key={t.q} topic={t} />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-textSecondary">
          Your account
        </h2>
        {COMMON.map((t) => (
          <TopicCard key={t.q} topic={t} />
        ))}
      </section>

      <p className="rounded-xl bg-bg p-4 text-sm text-textSecondary">
        Still stuck? Ask your school admin — and tell them what you clicked and what you saw on the screen.
      </p>
    </div>
  );
};

export default HelpPage;