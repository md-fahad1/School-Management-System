"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { RETURN_BOOK } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "./ui/ToastProvider";

const ReturnBookButton = ({ loanId }: { loanId: string }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleReturn = async () => {
    if (!confirm("Mark this book as returned?")) return;
    setLoading(true);
    try {
      const client = await getClientGqlClient();
      await client.request(RETURN_BOOK, { input: { loanId } });
      toast.success("Book marked as returned.");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't return this book."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleReturn}
      disabled={loading}
      className="text-xs bg-lamaSky px-3 py-1 rounded-md disabled:opacity-60 flex items-center gap-1"
    >
      <Check size={12} />
      {loading ? "Returning..." : "Return"}
    </button>
  );
};

export default ReturnBookButton;