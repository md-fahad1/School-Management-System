"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { UPDATE_SCHOLARSHIP, REMOVE_SCHOLARSHIP } from "@/lib/graphql/queries";

const DeactivateScholarshipButton = ({ id, active }: { id: string; active: boolean }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    setBusy(true);
    try {
      const client = await getClientGqlClient();
      await client.request(UPDATE_SCHOLARSHIP, { id, input: { active: !active } });
      router.refresh();
    } catch (err) {
      console.error("Failed to update scholarship:", err);
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
      router.refresh();
    } catch (err) {
      console.error("Failed to delete scholarship:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={busy}
        onClick={toggleActive}
        className="text-xs bg-lamaSky px-3 py-1 rounded-md hover:opacity-80 transition disabled:opacity-60"
      >
        {active ? "Deactivate" : "Activate"}
      </button>
      <button
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