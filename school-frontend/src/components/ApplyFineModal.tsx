"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalShell, { ModalLoading } from "./ModalShell";

const ApplyFineForm = dynamic(() => import("./forms/ApplyFineForm"), {
  loading: () => <ModalLoading />,
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
      {open && (
        <ModalShell onClose={() => setOpen(false)}>
          <ApplyFineForm
            invoiceId={invoiceId}
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </ModalShell>
      )}
    </>
  );
};

export default ApplyFineModal;