"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const RecordPaymentForm = dynamic(() => import("./forms/RecordPaymentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const RecordPaymentModal = ({ invoiceId, balance }: { invoiceId: string; balance: number }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        className="text-xs bg-lamaSky px-3 py-1 rounded-md hover:opacity-80 transition"
        onClick={() => setOpen(true)}
      >
        Record payment
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <RecordPaymentForm
              invoiceId={invoiceId}
              balance={balance}
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
            <div
              className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-brandInk"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecordPaymentModal;