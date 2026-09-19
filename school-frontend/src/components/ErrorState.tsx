"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

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

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  /** true hole poura screen jure dekhabe (dashboard er baire). */
  fullPage?: boolean;
};

const ErrorState = ({ error, reset, fullPage = false }: Props) => {
  const router = useRouter();

  // Technical detail ta user ke dekhai na, shudhu console e rakhi.
  useEffect(() => {
    console.error("Page crashed:", error);
  }, [error]);

  const goHome = () => {
    const role = Cookies.get("role") ?? "";
    router.push(ROLE_HOME[role] ?? "/");
  };

  return (
    <div
      className={`flex items-center justify-center p-6 ${
        fullPage ? "min-h-screen bg-bg" : "min-h-[60vh]"
      }`}
    >
      <div className="w-full max-w-md text-center bg-cardBg border border-border rounded-2xl shadow-sm p-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-warningLight text-warning flex items-center justify-center">
          <AlertTriangle size={28} />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-textPrimary">Something went wrong</h1>
        <p className="mt-2 text-sm text-textSecondary">
          Don&apos;t worry — your data is safe. This page had a problem loading. Please try
          again, and if it keeps happening, tell your school admin.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={reset} className="btn-primary">
            <RefreshCw size={16} />
            Try again
          </button>
          <button type="button" onClick={goHome} className="btn-secondary">
            <Home size={16} />
            Go to my dashboard
          </button>
        </div>

        {error.digest && (
          <p className="mt-5 text-xs text-textMuted">Error code: {error.digest}</p>
        )}
      </div>
    </div>
  );
};

export default ErrorState;