"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_CUSTOM_ROLE, UPDATE_CUSTOM_ROLE } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { prettyModule } from "@/lib/roles";
import { useToast } from "@/components/ui/ToastProvider";

export type PermissionItem = {
  id: string;
  key: string;
  module: string;
  action: string;
  description?: string | null;
};

type Props = {
  mode: "create" | "update";
  permissions: PermissionItem[];
  initial?: {
    id?: string;
    name: string;
    description?: string | null;
    permissionKeys: string[];
  };
  /** System roles can be viewed but not changed. */
  readOnly?: boolean;
};

// A checkbox that can show the "some selected" (indeterminate) state.
function ModuleCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={label}
      className="h-4 w-4 accent-accent"
    />
  );
}

const RoleForm = ({ mode, permissions, initial, readOnly = false }: Props) => {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set(initial?.permissionKeys ?? []));
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Permissions grouped by module, filtered by the search box.
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const map = new Map<string, PermissionItem[]>();
    for (const p of permissions) {
      const text = `${p.module} ${p.action} ${p.description ?? ""} ${p.key}`.toLowerCase();
      if (q && !text.includes(q)) continue;
      map.set(p.module, [...(map.get(p.module) ?? []), p]);
    }
    return Array.from(map.entries());
  }, [permissions, search]);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleModule = (items: PermissionItem[]) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = items.every((p) => next.has(p.key));
      items.forEach((p) => (allOn ? next.delete(p.key) : next.add(p.key)));
      return next;
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setError("");

    if (name.trim().length < 2) return setError("Role name must be at least 2 characters.");
    if (selected.size === 0) return setError("Pick at least one permission for this role.");

    setSaving(true);
    try {
      const client = await getClientGqlClient();
      const input = {
        name: name.trim(),
        description: description.trim() || null,
        permissionKeys: Array.from(selected),
      };
      if (mode === "create") {
        await client.request(CREATE_CUSTOM_ROLE, { input });
      } else {
        await client.request(UPDATE_CUSTOM_ROLE, { id: initial?.id, input });
      }
      toast.success(mode === "create" ? "Role created." : "Role updated.");
      router.push("/admin/roles");
      router.refresh();
    } catch (err: any) {
      const msg = getErrorMessage(err, "Couldn't save this role. Please try again.");
      setError(msg.toLowerCase().includes("already exists") ? "A role with this name already exists." : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {/* ---------- Basic info ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role-name" className="text-xs font-medium text-textSecondary">
            Role name
          </label>
          <input
            id="role-name"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Class Teacher"
            disabled={readOnly}
            maxLength={60}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role-desc" className="text-xs font-medium text-textSecondary">
            Description (optional)
          </label>
          <input
            id="role-desc"
            className="field"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this role for?"
            disabled={readOnly}
            maxLength={200}
          />
        </div>
      </div>

      {/* ---------- Permissions ---------- */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-textPrimary">Permissions</h2>
            <p className="text-xs text-textMuted">
              {selected.size} of {permissions.length} selected
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                className="field pl-9"
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {!readOnly && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelected(new Set(permissions.map((p) => p.key)))}
                >
                  Select all
                </button>
                <button type="button" className="btn-secondary" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-textMuted py-6 text-center">No permissions match “{search}”.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {groups.map(([module, items]) => {
              const onCount = items.filter((p) => selected.has(p.key)).length;
              return (
                <div key={module} className="border border-border rounded-xl overflow-hidden">
                  <label className="flex items-center gap-3 bg-bg px-4 py-2.5 cursor-pointer">
                    <ModuleCheckbox
                      checked={onCount === items.length}
                      indeterminate={onCount > 0 && onCount < items.length}
                      onChange={() => toggleModule(items)}
                      disabled={readOnly}
                      label={`Select all ${prettyModule(module)} permissions`}
                    />
                    <span className="font-medium text-sm text-textPrimary flex-1">{prettyModule(module)}</span>
                    <span className="text-xs text-textMuted">
                      {onCount}/{items.length}
                    </span>
                  </label>

                  <ul className="divide-y divide-border">
                    {items.map((p) => (
                      <li key={p.key}>
                        <label className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-accentLight/40">
                          <input
                            type="checkbox"
                            className="h-4 w-4 mt-0.5 accent-accent"
                            checked={selected.has(p.key)}
                            onChange={() => toggle(p.key)}
                            disabled={readOnly}
                          />
                          <span className="flex flex-col">
                            <span className="text-sm text-textPrimary">{p.description || p.key}</span>
                            <span className="text-[11px] text-textMuted">{p.key}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------- Footer ---------- */}
      {!readOnly && (
        <div className="sticky bottom-0 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-cardBg border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p role="alert" className="text-sm text-danger min-h-[1.25rem]">
            {error}
          </p>
          <div className="flex gap-2 sm:justify-end">
            <Link href="/admin/roles" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : mode === "create" ? "Create role" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default RoleForm;