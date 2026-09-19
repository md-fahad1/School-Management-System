"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Modal from "./ui/Modal";
import { useToast } from "./ui/ToastProvider";
import { getClientGqlClient } from "@/lib/graphql/client";
import { REMOVE_CUSTOM_ROLE } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const DeleteRoleButton = ({ id, name }: { id: string; name: string }) => {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    setError("");
  };

  const handleDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(REMOVE_CUSTOM_ROLE, { id });
      close();
      toast.success("Role deleted.");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't delete this role. Please try again."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Delete role"
        aria-label={`Delete role ${name}`}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-dangerLight text-danger hover:bg-danger hover:text-white transition-colors"
      >
        <Trash2 size={14} />
      </button>

      <Modal open={open} onClose={close} title="Delete this role?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-textSecondary">
            You're about to delete <b className="text-textPrimary">{name}</b>. Anyone who has this role will go
            back to the default permissions for their account type.
          </p>

          {error && (
            <p role="alert" className="rounded-lg bg-dangerLight text-danger text-sm px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} disabled={deleting} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger">
              <Trash2 size={16} />
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DeleteRoleButton;