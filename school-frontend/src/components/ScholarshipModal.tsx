"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "./ui/Modal";

const ScholarshipForm = dynamic(() => import("./forms/ScholarshipForm"), {
  loading: () => <div className="animate-pulse h-40 bg-bg rounded-xl" />,
});

const ScholarshipModal = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className="btn-accent !py-2 !px-3.5 whitespace-nowrap"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} />
        Add Scholarship
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add a scholarship">
        <ScholarshipForm
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
};

export default ScholarshipModal;