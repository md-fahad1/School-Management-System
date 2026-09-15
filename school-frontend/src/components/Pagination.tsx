"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const Pagination = ({
  page = 1,
  hasNextPage = false,
}: {
  page?: number;
  hasNextPage?: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        <span className="px-2 rounded-sm bg-lamaSky">{page}</span>
      </div>
      <button
        disabled={!hasNextPage}
        onClick={() => goToPage(page + 1)}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;