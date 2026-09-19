"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "./ui/Modal";

const LeaveApplyForm = dynamic(() => import("./forms/LeaveApplyForm"), {
  loading: () => <div className="animate-pulse h-40 bg-bg rounded-xl" />,
});

const LeaveApplyModal = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 whitespace-nowrap"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} />
        Apply for Leave
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Apply for leave">
        <LeaveApplyForm
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
};

export default LeaveApplyModal;