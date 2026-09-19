"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./ui/Modal";

const RecordPaymentForm = dynamic(() => import("./forms/RecordPaymentForm"), {
  loading: () => <div className="animate-pulse h-40 bg-bg rounded-xl" />,
});

const RecordPaymentModal = ({ invoiceId, balance }: { invoiceId: string; balance: number }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className="text-xs bg-lamaSky px-3 py-1 rounded-md hover:opacity-80 transition"
        onClick={() => setOpen(true)}
      >
        Record payment
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Record a payment">
        <RecordPaymentForm
          invoiceId={invoiceId}
          balance={balance}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
};

export default RecordPaymentModal;