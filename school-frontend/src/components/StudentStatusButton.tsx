"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { UPDATE_STUDENT_STATUS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";
import { STUDENT_STATUSES, STATUS_LABEL, type StudentStatus } from "@/lib/studentStatus";

type Props = {
  id: string;
  name: string;
  status?: string | null;
  pill?: boolean; // labelled pill button (cards / detail page) instead of a round icon
};

const inputCls =
  "w-full px-3 py-2 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent";

export default function StudentStatusButton({ id, name, status, pill }: Props) {
  const router = useRouter();
  const toast = useToast();
  const current = (status ?? "ACTIVE") as StudentStatus;

  const [open, setOpen] = useState(false);
  const [next, setNext] = useState<StudentStatus>(current);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openModal = () => {
    setNext(current);
    setReason("");
    setError("");
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (next === current) return;
    setSaving(true);
    setError("");
    try {
      const client = await getClientGqlClient();
      const input: { status: StudentStatus; reason?: string } = { status: next };
      if (reason.trim()) input.reason = reason.trim();
      await client.request(UPDATE_STUDENT_STATUS, { id, input });
      toast.success(`${name} is now ${STATUS_LABEL[next].toLowerCase()}.`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update status"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {pill ? (
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-cardBg text-textPrimary hover:bg-accentLight transition-colors"
        >
          <UserCog size={14} />
          Status
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          title="Change status"
          aria-label="Change status"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-infoLight"
        >
          <UserCog size={16} className="text-textSecondary" />
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Change student status">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-sm text-textSecondary">
            <span className="font-semibold">{name}</span> is currently{" "}
            <span className="font-semibold">{STATUS_LABEL[current]}</span>.
          </p>

          <div>
            <label className="block mb-1 text-sm text-textSecondary">New status</label>
            <select
              value={next}
              onChange={(e) => setNext(e.target.value as StudentStatus)}
              className={inputCls}
            >
              {STUDENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-textSecondary">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Transferred to another school"
              className={inputCls}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving || next === current}
            className="bg-primary text-white py-2 rounded-lg text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update status"}
          </button>
        </form>
      </Modal>
    </>
  );
}