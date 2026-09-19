"use client";

import { Check } from "lucide-react";

type Option = { id: string; name: string };

type Props = {
  label: string;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  emptyText?: string;
};

// Click-to-toggle chips — replaces the native <select multiple>, which
// needs Ctrl/Cmd-click and is easy to misuse.
const MultiSelectChips = ({
  label,
  options,
  value,
  onChange,
  emptyText = "Nothing to choose from yet",
}: Props) => {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#4a5168]">{label}</span>
        <span className="text-xs text-textMuted">{value.length} selected</span>
      </div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-[#d9deea] bg-[#fafbfe] p-3 max-h-40 overflow-y-auto">
        {options.length === 0 ? (
          <span className="text-sm text-textMuted">{emptyText}</span>
        ) : (
          options.map((o) => {
            const on = value.includes(o.id);
            return (
              <button
                type="button"
                key={o.id}
                aria-pressed={on}
                onClick={() => toggle(o.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  on
                    ? "bg-accent border-accent text-white"
                    : "bg-white border-[#d9deea] text-textSecondary hover:border-accent hover:text-accent"
                }`}
              >
                {on && <Check size={12} strokeWidth={3} />}
                {o.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MultiSelectChips;