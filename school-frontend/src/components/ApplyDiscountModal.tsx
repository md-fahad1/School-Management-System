"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./ui/Modal";

const ApplyDiscountForm = dynamic(() => import("./forms/ApplyDiscountForm"), {
  loading: () => <div className="animate-pulse h-40 bg-bg rounded-xl" />,
});

const ApplyDiscountModal = ({ invoiceId, amount }: { invoiceId: string; amount: number }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className="text-xs bg-lamaYellow px-3 py-1 rounded-md hover:opacity-80 transition"
        onClick={() => setOpen(true)}
      >
        Discount
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Apply a discount">
        <ApplyDiscountForm
          invoiceId={invoiceId}
          amount={amount}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
};

export default ApplyDiscountModal;