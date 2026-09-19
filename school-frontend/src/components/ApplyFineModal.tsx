"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./ui/Modal";

const ApplyFineForm = dynamic(() => import("./forms/ApplyFineForm"), {
  loading: () => <div className="animate-pulse h-40 bg-bg rounded-xl" />,
});

const ApplyFineModal = ({ invoiceId }: { invoiceId: string }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-md hover:opacity-80 transition"
        onClick={() => setOpen(true)}
      >
        Fine
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Apply a fine">
        <ApplyFineForm
          invoiceId={invoiceId}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
};

export default ApplyFineModal;