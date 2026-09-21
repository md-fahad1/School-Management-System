"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STUDENT_STATUSES, STATUS_LABEL } from "@/lib/studentStatus";

export default function StudentStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set("status", e.target.value);
    else params.delete("status");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      aria-label="Filter by status"
      className="w-full md:w-auto px-3 py-2 text-sm bg-bg border border-border rounded-full outline-none focus:border-accent"
    >
      <option value="">All statuses</option>
      {STUDENT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}