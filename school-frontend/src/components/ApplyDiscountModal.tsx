"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalShell, { ModalLoading } from "./ModalShell";

const ApplyDiscountForm = dynamic(() => import("./forms/ApplyDiscountForm"), {
  loading: () => <ModalLoading />,
});

const ApplyDiscountModal = ({ invoiceId, amount }: { invoiceId: string; amount: number }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        className="text-xs bg-lamaYellow px-3 py-1 rounded-md hover:opacity-80 transition"
        onClick={() => setOpen(true)}
      >
        Discount
      </button>
      {open && (
        <ModalShell onClose={() => setOpen(false)}>
          <ApplyDiscountForm
            invoiceId={invoiceId}
            amount={amount}
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

export default ApplyDiscountModal;