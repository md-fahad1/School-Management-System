"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Modal from "./ui/Modal";
import { useToast } from "./ui/ToastProvider";
import { getClientGqlClient } from "@/lib/graphql/client";
import { SET_CURRENT_ACADEMIC_YEAR } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const SetCurrentYearButton = ({ id, name }: { id: string; name: string }) => {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    setError("");
  };

  const confirm = async () => {
    setError("");
    setSaving(true);
    try {
      const client = await getClientGqlClient();
      await client.request(SET_CURRENT_ACADEMIC_YEAR, { id });
      close();
      toast.success(`${name} is now the current academic year.`);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't change the current year. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary !py-1.5 !px-3">
        <CheckCircle2 size={14} /> Set as current
      </button>

      <Modal open={open} onClose={close} title="Change the current academic year?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-textSecondary">
            <b className="text-textPrimary">{name}</b> will become the current academic year for your whole
            school. Only one year can be current, so the previous one will be unmarked.
          </p>

          {error && (
            <p role="alert" className="rounded-lg bg-dangerLight text-danger text-sm px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} disabled={saving} className="btn-secondary">Cancel</button>
            <button type="button" onClick={confirm} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Yes, make it current"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SetCurrentYearButton;