"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { getClientGqlClient } from "@/lib/graphql/client";
import {
  GET_INSTITUTIONS,
  CREATE_INSTITUTION,
  SET_INSTITUTION_STATUS,
} from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import Modal from "@/components/ui/Modal";
import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/components/ui/ToastProvider";

type Status = "TRIAL" | "ACTIVE" | "SUSPENDED";

type Institution = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: Status;
  createdAt: string;
};

const TYPE_OPTIONS = ["SCHOOL", "COLLEGE", "SCHOOL_AND_COLLEGE", "MADRASA", "OTHER"];

const statusColor: Record<Status, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  TRIAL: "bg-yellow-100 text-yellow-700",
  SUSPENDED: "bg-red-100 text-red-700",
};

const emptyForm = {
  name: "",
  slug: "",
  type: "SCHOOL",
  adminName: "",
  adminSurname: "",
  adminUsername: "",
  adminEmail: "",
  adminPassword: "",
};

const inputCls =
  "w-full px-3 py-2 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block mb-1 text-sm text-textSecondary">{label}</label>
      {children}
    </div>
  );
}

export default function SuperAdminPage() {
  const toast = useToast();
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      const client = await getClientGqlClient();
      const data = await client.request<{ institutions: Institution[] }>(GET_INSTITUTIONS, {
        skip: 0,
        take: 100,
      });
      setItems(data.institutions);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load institutions"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      // slug: lowercase, spaces become hyphens
      [name]: name === "slug" ? value.toLowerCase().replace(/\s+/g, "-") : value,
    }));
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!/^[a-z0-9-]{3,40}$/.test(form.slug)) {
      setFormError("Slug must be 3-40 characters: lowercase letters, numbers, hyphens.");
      return;
    }

    setSaving(true);
    try {
      const client = await getClientGqlClient();
      await client.request(CREATE_INSTITUTION, { input: form });
      toast.success(`${form.name} created. Its admin can sign in now.`);
      setOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create institution"));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (inst: Institution, status: Status) => {
    const verb = status === "SUSPENDED" ? "suspend" : "activate";
    if (!window.confirm(`Are you sure you want to ${verb} ${inst.name}?`)) return;
    try {
      const client = await getClientGqlClient();
      await client.request(SET_INSTITUTION_STATUS, { id: inst.id, status });
      toast.success(`${inst.name} ${status === "SUSPENDED" ? "suspended" : "activated"}.`);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update status"));
    }
  };

  const count = (s: Status) => items.filter((i) => i.status === s).length;

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-textPrimary">Institutions</h1>
          <p className="text-xs text-textMuted mt-1">
            {items.length} total · {count("ACTIVE")} active · {count("TRIAL")} trial ·{" "}
            {count("SUSPENDED")} suspended
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primaryDark transition-colors"
        >
          New institution
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
      {loading && <p className="text-sm text-textMuted mt-4">Loading...</p>}

      {!loading && !error && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-textMuted border-b border-border">
                <th className="p-3">Name</th>
                <th className="p-3">Code</th>
                <th className="p-3 hidden md:table-cell">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3 hidden md:table-cell">Created</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inst) => (
                <tr
                  key={inst.id}
                  className="border-b border-border even:bg-bg/50 hover:bg-accentLight transition-colors"
                >
                  <td className="p-3 font-semibold">{inst.name}</td>
                  <td className="p-3">{inst.slug}</td>
                  <td className="p-3 hidden md:table-cell">{inst.type.replace(/_/g, " ")}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColor[inst.status]}`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    {new Date(inst.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td className="p-3">
                    {inst.status === "SUSPENDED" ? (
                      <button
                        type="button"
                        onClick={() => changeStatus(inst, "ACTIVE")}
                        className="text-xs px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => changeStatus(inst, "SUSPENDED")}
                        className="text-xs px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-textMuted">
                    No institutions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New institution">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <Field label="Institution name">
            <input name="name" value={form.name} onChange={handleChange} className={inputCls} required />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Code (slug)">
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="abc-school"
                className={inputCls}
                required
              />
            </Field>
            <Field label="Type">
              <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <p className="text-xs font-semibold text-textMuted uppercase mt-2">First admin account</p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input name="adminName" value={form.adminName} onChange={handleChange} className={inputCls} required />
            </Field>
            <Field label="Surname">
              <input name="adminSurname" value={form.adminSurname} onChange={handleChange} className={inputCls} required />
            </Field>
          </div>

          <Field label="Username">
            <input name="adminUsername" value={form.adminUsername} onChange={handleChange} className={inputCls} required />
          </Field>

          <Field label="Email">
            <input type="email" name="adminEmail" value={form.adminEmail} onChange={handleChange} className={inputCls} required />
          </Field>

          <Field label="Temporary password (letters + numbers, 6+)">
            <PasswordInput
              name="adminPassword"
              autoComplete="new-password"
              value={form.adminPassword}
              onChange={handleChange}
              className={inputCls}
              required
            />
          </Field>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white py-2 rounded-lg text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create institution"}
          </button>
        </form>
      </Modal>
    </div>
  );
}