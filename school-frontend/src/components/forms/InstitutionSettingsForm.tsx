"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { UPDATE_MY_INSTITUTION } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "@/components/ui/ToastProvider";
import {
  uploadToCloudinary,
  MAX_AVATAR_SIZE_BYTES,
  ACCEPTED_AVATAR_TYPES,
} from "@/lib/cloudinary";

type Initial = {
  name: string;
  slug: string;
  type: string;
  eiin?: string | null;
  logo?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  establishedYear?: number | null;
};

const inputCls =
  "w-full px-3 py-2 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent";

export default function InstitutionSettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: initial.name ?? "",
    eiin: initial.eiin ?? "",
    phone: initial.phone ?? "",
    email: initial.email ?? "",
    address: initial.address ?? "",
    website: initial.website ?? "",
    establishedYear: initial.establishedYear ? String(initial.establishedYear) : "",
  });
  const [logo, setLogo] = useState(initial.logo ?? "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError("Image is too large. Please choose one under 5MB.");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadToCloudinary(file, setProgress, "logos");
      setLogo(url);
    } catch (err) {
      setError(getErrorMessage(err, "Logo upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Empty optional fields are left out (the backend validates email etc.
    // only when a value is present).
    const input: Record<string, unknown> = { name: form.name.trim() };
    for (const key of ["eiin", "phone", "email", "address", "website"] as const) {
      const v = form[key].trim();
      if (v) input[key] = v;
    }
    if (logo) input.logo = logo;
    if (form.establishedYear.trim()) input.establishedYear = Number(form.establishedYear);

    setSaving(true);
    try {
      const client = await getClientGqlClient();
      await client.request(UPDATE_MY_INSTITUTION, { input });
      toast.success("Institution details saved.");
      router.refresh(); // so the sidebar picks up the new name/logo
    } catch (err) {
      setError(getErrorMessage(err, "Could not save changes"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo || "/logo.png"}
          alt="Institution logo"
          className="w-16 h-16 rounded-lg object-cover border border-border bg-bg"
        />
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-bg disabled:opacity-60"
          >
            {uploading ? `Uploading ${progress}%` : "Change logo"}
          </button>
          <p className="text-xs text-textMuted mt-1">JPG, PNG or WebP, up to 5MB.</p>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_AVATAR_TYPES.join(",")}
            onChange={handleLogo}
            className="hidden"
          />
        </div>
      </div>

      <div className="text-sm bg-bg border border-border rounded-lg px-3 py-2">
        <span className="text-textMuted">Institution code: </span>
        <span className="font-semibold">{initial.slug}</span>
        <span className="text-textMuted"> (parents need this to sign up)</span>
      </div>

      <div>
        <label className="block mb-1 text-sm text-textSecondary">Institution name</label>
        <input name="name" value={form.name} onChange={handleChange} className={inputCls} required minLength={2} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 text-sm text-textSecondary">EIIN</label>
          <input name="eiin" value={form.eiin} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className="block mb-1 text-sm text-textSecondary">Established year</label>
          <input
            type="number"
            name="establishedYear"
            min={1800}
            max={2100}
            value={form.establishedYear}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-textSecondary">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className="block mb-1 text-sm text-textSecondary">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm text-textSecondary">Address</label>
        <input name="address" value={form.address} onChange={handleChange} className={inputCls} />
      </div>

      <div>
        <label className="block mb-1 text-sm text-textSecondary">Website</label>
        <input name="website" value={form.website} onChange={handleChange} className={inputCls} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-primary text-white py-2 rounded-lg text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}