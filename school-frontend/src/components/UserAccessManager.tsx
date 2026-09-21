"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Cookies from "js-cookie";
import { getClientGqlClient } from "@/lib/graphql/client";
import {
  GET_USER_ACCESS_LIST,
  GET_USER_ACCESS,
  GET_CUSTOM_ROLES,
  GET_PERMISSIONS,
  ASSIGN_USER_ROLE,
  SET_USER_PERMISSION,
  REMOVE_USER_PERMISSION,
} from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";

type Row = {
  userId: string;
  username: string;
  baseRole: string;
  customRoleId?: string | null;
  customRoleName?: string | null;
};

type Access = Row & {
  overrides: { permissionKey: string; granted: boolean }[];
  effectivePermissions: string[];
};

type RoleOpt = { id: string; name: string; isSystem: boolean; baseRole?: string | null };
type Perm = { id: string; key: string; module: string; action: string };

const inputCls =
  "w-full px-3 py-2 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent";

const pretty = (r: string) => r.replace(/_/g, " ").toLowerCase();

export default function UserAccessManager() {
  const toast = useToast();

  const [rows, setRows] = useState<Row[]>([]);
  const [roles, setRoles] = useState<RoleOpt[]>([]);
  const [perms, setPerms] = useState<Perm[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selected, setSelected] = useState<Row | null>(null);
  const [access, setAccess] = useState<Access | null>(null);
  const [roleChoice, setRoleChoice] = useState("");
  const [newPerm, setNewPerm] = useState("");
  const [newMode, setNewMode] = useState<"grant" | "revoke">("grant");
  const [busy, setBusy] = useState(false);

  const myId = Cookies.get("userId");

  const loadRows = useCallback(async (q?: string) => {
    try {
      const client = await getClientGqlClient();
      const data = await client.request<{ userAccessList: Row[] }>(GET_USER_ACCESS_LIST, {
        search: q || undefined,
      });
      setRows(data.userAccessList);
      setLoadError("");
    } catch (err) {
      setLoadError(getErrorMessage(err, "Could not load users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
    (async () => {
      try {
        const client = await getClientGqlClient();
        const [r, p] = await Promise.all([
          client.request<{ customRoles: RoleOpt[] }>(GET_CUSTOM_ROLES),
          client.request<{ permissions: Perm[] }>(GET_PERMISSIONS),
        ]);
        setRoles(r.customRoles);
        setPerms(p.permissions);
      } catch (err) {
        setLoadError(getErrorMessage(err, "Could not load roles and permissions"));
      }
    })();
  }, [loadRows]);

  const permsByModule = useMemo(() => {
    const groups: Record<string, Perm[]> = {};
    perms.forEach((p) => {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    });
    return groups;
  }, [perms]);

  const refreshAccess = async (userId: string) => {
    try {
      const client = await getClientGqlClient();
      const data = await client.request<{ userAccess: Access }>(GET_USER_ACCESS, { userId });
      setAccess(data.userAccess);
      setRoleChoice(data.userAccess.customRoleId ?? "");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not load access details"));
    }
  };

  const openManage = async (row: Row) => {
    setSelected(row);
    setAccess(null);
    setRoleChoice(row.customRoleId ?? "");
    setNewPerm("");
    setNewMode("grant");
    await refreshAccess(row.userId);
  };

  const run = async (fn: () => Promise<void>, fallback: string) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error(getErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const saveRole = () =>
    run(async () => {
      if (!selected) return;
      const client = await getClientGqlClient();
      await client.request(ASSIGN_USER_ROLE, {
        input: { userId: selected.userId, customRoleId: roleChoice || null },
      });
      toast.success("Role updated.");
      await refreshAccess(selected.userId);
      await loadRows(search);
    }, "Could not update the role");

  const addOverride = () =>
    run(async () => {
      if (!selected || !newPerm) return;
      const client = await getClientGqlClient();
      await client.request(SET_USER_PERMISSION, {
        input: { userId: selected.userId, permissionKey: newPerm, granted: newMode === "grant" },
      });
      setNewPerm("");
      await refreshAccess(selected.userId);
    }, "Could not save the override");

  const removeOverride = (permissionKey: string) =>
    run(async () => {
      if (!selected) return;
      const client = await getClientGqlClient();
      await client.request(REMOVE_USER_PERMISSION, { userId: selected.userId, permissionKey });
      await refreshAccess(selected.userId);
    }, "Could not remove the override");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    loadRows(search);
  };

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-textPrimary">User Access</h1>
          <p className="text-xs text-textMuted mt-1">
            Assign a role to an account and fine-tune individual permissions.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username"
            className="px-3 py-2 text-sm bg-bg border border-border rounded-lg outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primaryDark"
          >
            Search
          </button>
        </form>
      </div>

      {loading && <p className="text-sm text-textMuted mt-4">Loading...</p>}
      {loadError && <p className="text-sm text-red-500 mt-4">{loadError}</p>}

      {!loading && !loadError && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-textMuted border-b border-border">
                <th className="p-3">Username</th>
                <th className="p-3">Base role</th>
                <th className="p-3">Assigned role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.userId}
                  className="border-b border-border even:bg-bg/50 hover:bg-accentLight transition-colors"
                >
                  <td className="p-3 font-semibold">{r.username}</td>
                  <td className="p-3 capitalize">{pretty(r.baseRole)}</td>
                  <td className="p-3">
                    {r.customRoleName ?? <span className="text-textMuted">Default</span>}
                  </td>
                  <td className="p-3">
                    {r.userId === myId ? (
                      <span className="text-xs text-textMuted">You</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openManage(r)}
                        className="text-xs px-3 py-1 rounded-md border border-border hover:bg-bg"
                      >
                        Manage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-textMuted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Access: ${selected.username}` : "Access"}
      >
        {selected && (
          <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
            <p className="text-sm text-textSecondary">
              Base role: <span className="font-semibold capitalize">{pretty(selected.baseRole)}</span>
            </p>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-textPrimary">Assigned role</label>
              <div className="flex gap-2">
                <select
                  value={roleChoice}
                  onChange={(e) => setRoleChoice(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Default for {pretty(selected.baseRole)}</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.isSystem ? " (system)" : ""}
                      {r.baseRole ? ` · ${pretty(r.baseRole)}` : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={saveRole}
                  disabled={busy || !access}
                  className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primaryDark disabled:opacity-60"
                >
                  Save
                </button>
              </div>
              <p className="text-xs text-textMuted">
                &quot;Default&quot; uses the built-in permissions for their base role.
              </p>
            </div>

            {/* Overrides */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-textPrimary">
                Individual overrides
              </label>

              {!access && <p className="text-sm text-textMuted">Loading...</p>}

              {access && access.overrides.length === 0 && (
                <p className="text-xs text-textMuted">No overrides. This account follows its role.</p>
              )}

              {access?.overrides.map((o) => (
                <div
                  key={o.permissionKey}
                  className="flex items-center justify-between gap-2 text-sm border border-border rounded-lg px-3 py-2"
                >
                  <span className="truncate">{o.permissionKey}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        o.granted ? "bg-successLight text-success" : "bg-dangerLight text-danger"
                      }`}
                    >
                      {o.granted ? "Granted" : "Revoked"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeOverride(o.permissionKey)}
                      disabled={busy}
                      className="text-xs px-2 py-0.5 rounded-md border border-border hover:bg-bg disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <select
                  value={newPerm}
                  onChange={(e) => setNewPerm(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Choose a permission</option>
                  {Object.entries(permsByModule).map(([module, list]) => (
                    <optgroup key={module} label={module}>
                      {list.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.key}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <select
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value as "grant" | "revoke")}
                  className="px-3 py-2 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent"
                >
                  <option value="grant">Grant</option>
                  <option value="revoke">Revoke</option>
                </select>
                <button
                  type="button"
                  onClick={addOverride}
                  disabled={busy || !newPerm}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-bg disabled:opacity-60"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-textMuted">
                Grant adds a permission the role does not have. Revoke takes one away.
              </p>
            </div>

            {/* Effective */}
            {access && (
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold text-textPrimary">
                  Effective permissions ({access.effectivePermissions.length})
                </summary>
                <div className="flex flex-wrap gap-1 mt-2">
                  {access.effectivePermissions.map((k) => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-bg border border-border">
                      {k}
                    </span>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}