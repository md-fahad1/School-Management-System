"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { RETURN_BOOK } from "@/lib/graphql/queries";

const ReturnBookButton = ({ loanId }: { loanId: string }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReturn = async () => {
    if (!confirm("Mark this book as returned?")) return;
    setLoading(true);
    try {
      const client = await getClientGqlClient();
      await client.request(RETURN_BOOK, { input: { loanId } });
      router.refresh();
    } catch (err: any) {
      alert(err?.response?.errors?.[0]?.message ?? "Failed to return book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
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