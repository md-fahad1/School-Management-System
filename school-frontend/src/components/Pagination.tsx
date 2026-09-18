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
    <div className="pt-4 flex items-center justify-between text-textSecondary">
      <button
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
        className="py-2 px-4 rounded-lg bg-bg border border-border text-xs font-semibold hover:bg-accentLight disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-bg"
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white font-medium">
          {page}
        </span>
      </div>
      <button
        disabled={!hasNextPage}
        onClick={() => goToPage(page + 1)}
        className="py-2 px-4 rounded-lg bg-bg border border-border text-xs font-semibold hover:bg-accentLight disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-bg"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;