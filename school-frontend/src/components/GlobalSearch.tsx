"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { GLOBAL_SEARCH } from "@/lib/graphql/queries";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Result = { type: string; id: string; title: string; subtitle?: string; url: string };

const typeLabel: Record<string, string> = {
  student: "🎓",
  teacher: "👩‍🏫",
  class: "🏫",
  subject: "📘",
  book: "📚",
};

const GlobalSearch = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const client = await getClientGqlClient();
        const data = await client.request<{ globalSearch: Result[] }>(GLOBAL_SEARCH, { query });
        setResults(data.globalSearch);
        setOpen(true);
      } catch (err) {
        console.error("Global search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
     <div ref={boxRef} className="relative flex-1 max-w-[420px]">
      <div className="flex items-center gap-2 text-sm rounded-full bg-bg border border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight px-4 transition-colors">
        <Search size={14} className="opacity-50" />
        <input
          type="text"
          placeholder={t("common.findAnything")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full p-2.5 bg-transparent border-0 rounded-full outline-none focus:outline-none focus:ring-0 focus:shadow-none appearance-none [-webkit-appearance:none] [-webkit-tap-highlight-color:transparent] text-base md:text-sm placeholder:text-textMuted"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-cardBg rounded-xl shadow-lg ring-1 ring-border max-h-[360px] overflow-y-auto z-50">
          {loading && <div className="p-3 text-xs text-textMuted">{t("common.searching")}</div>}
          {!loading && results.length === 0 && (
            <div className="p-3 text-xs text-textMuted">{t("common.noResults")}</div>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => goTo(r.url)}
                className="w-full text-left px-3 py-2.5 hover:bg-accentLight text-sm flex items-center gap-2 border-b border-border last:border-b-0"
              >
                <span>{typeLabel[r.type] ?? "🔎"}</span>
                <span className="flex-1 truncate">
                  {r.title}
                  {r.subtitle && <span className="text-xs text-textMuted ml-1">— {r.subtitle}</span>}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;