"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { DECIDE_LEAVE, CANCEL_LEAVE } from "@/lib/graphql/queries";

const LeaveDecideButtons = ({
  id,
  status,
  canDecide,
  isOwn,
}: {
  id: string;
  status: string;
  canDecide: boolean;
  isOwn: boolean;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status !== "PENDING") return null;

  const decide = async (newStatus: "APPROVED" | "REJECTED") => {
    setLoading(true);
    try {
      const client = await getClientGqlClient();
      await client.request(DECIDE_LEAVE, { input: { id, status: newStatus } });
      router.refresh();
    } catch (err) {
      console.error("Failed to decide leave:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setLoading(true);
    try {
      const client = await getClientGqlClient();
      await client.request(CANCEL_LEAVE, { id });
      router.refresh();
    } catch (err) {
      console.error("Failed to cancel leave:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {canDecide && (
        <>
          <button
            disabled={loading}
            onClick={() => decide("APPROVED")}
            className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            disabled={loading}
            onClick={() => decide("REJECTED")}
            className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 disabled:opacity-60"
          >
            Reject
          </button>
        </>
      )}
      {isOwn && (
        <button
          disabled={loading}
          onClick={cancel}
          className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 disabled:opacity-60"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default LeaveDecideButtons;