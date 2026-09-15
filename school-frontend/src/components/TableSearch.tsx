"use client";

import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const TableSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  const pushSearch = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("search", next);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushSearch(next), 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearch(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2"
    >
      <button type="submit" aria-label="Search">
        <Image src="/search.png" alt="" width={14} height={14} />
      </button>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search..."
        className="w-full md:w-[200px] p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;