"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { UPDATE_SCHOLARSHIP, REMOVE_SCHOLARSHIP } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "./ui/ToastProvider";

const DeactivateScholarshipButton = ({ id, active }: { id: string; active: boolean }) => {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    setBusy(true);
    try {
      const client = await getClientGqlClient();
      await client.request(UPDATE_SCHOLARSHIP, { id, input: { active: !active } });
      toast.success(active ? "Scholarship deactivated." : "Scholarship activated.");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update this scholarship."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this scholarship permanently?")) return;
    setBusy(true);
    try {
      const client = await getClientGqlClient();
      await client.request(REMOVE_SCHOLARSHIP, { id });
      toast.success("Scholarship deleted.");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this scholarship."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={toggleActive}
        className="text-xs bg-lamaSky px-3 py-1 rounded-md hover:opacity-80 transition disabled:opacity-60"
      >
        {active ? "Deactivate" : "Activate"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-md hover:opacity-80 transition disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
};

export default DeactivateScholarshipButton;