"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { DECIDE_LEAVE, CANCEL_LEAVE } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "./ui/ToastProvider";

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
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  if (status !== "PENDING") return null;

  const decide = async (newStatus: "APPROVED" | "REJECTED") => {
    setLoading(true);
    try {
      const client = await getClientGqlClient();
      await client.request(DECIDE_LEAVE, { input: { id, status: newStatus } });
      toast.success(newStatus === "APPROVED" ? "Leave approved." : "Leave rejected.");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update this leave request."));
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setLoading(true);
    try {
      const client = await getClientGqlClient();
      await client.request(CANCEL_LEAVE, { id });
      toast.success("Leave request cancelled.");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't cancel this leave request."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {canDecide && (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => decide("APPROVED")}
            className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:opacity-80 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => decide("REJECTED")}
            className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:opacity-80 disabled:opacity-60"
          >
            Reject
          </button>
        </>
      )}
      {isOwn && (
        <button
          type="button"
          disabled={loading}
          onClick={cancel}
          className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:opacity-80 disabled:opacity-60"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default LeaveDecideButtons;