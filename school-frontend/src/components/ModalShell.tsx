"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

// Shown while a lazily-loaded form downloads.
export const ModalLoading = () => (
  <div className="flex items-center justify-center gap-3 py-16 text-sm text-textSecondary">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
    Loading form...
  </div>
);

// Shared popup frame for the small stand-alone modals (fine, discount,
// payment, leave, ...). The form inside is styled by the .modal-form
// rules in globals.css, same as FormModal.
const ModalShell = ({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) => {
  // Esc closes the modal and the page behind it stops scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="modal-card modal-form relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-cardBg p-6 shadow-2xl sm:p-8"
      >
        {children}
        <button
          type="button"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-textMuted transition-colors hover:bg-gray-100 hover:text-textPrimary"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ModalShell;