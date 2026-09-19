import Link from "next/link";
import { cookies } from "next/headers";
import { SearchX } from "lucide-react";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
  principal: "/principal",
  accountant: "/accountant",
  librarian: "/librarian",
  transport_staff: "/transport-staf",
};

export default function NotFound() {
  const role = cookies().get("role")?.value ?? "";
  const home = ROLE_HOME[role];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center bg-cardBg border border-border rounded-2xl shadow-sm p-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-accentLight text-accent flex items-center justify-center">
          <SearchX size={28} />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-textPrimary">Page not found</h1>
        <p className="mt-2 text-sm text-textSecondary">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link href={home ?? "/"} className="btn-primary mt-6">
          {home ? "Go to my dashboard" : "Go to home"}
        </Link>
      </div>
    </div>
  );
}