"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { LOGOUT_ALL_DEVICES } from "@/lib/graphql/queries";
import { performLogout } from "@/lib/auth/logout";
import { getErrorMessage } from "@/lib/errors";

export default function LogoutAllDevicesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (!window.confirm("Sign out of every device, including this one?")) return;
    setLoading(true);
    setError("");
    try {
      const client = await getClientGqlClient();
      await client.request(LOGOUT_ALL_DEVICES);
      await performLogout(); // clear this device's session too
      router.push("/signin");
    } catch (err) {
      setError(getErrorMessage(err, "Could not sign out of all devices"));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-fit text-sm px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        {loading ? "Signing out..." : "Sign out of all devices"}
      </button>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}