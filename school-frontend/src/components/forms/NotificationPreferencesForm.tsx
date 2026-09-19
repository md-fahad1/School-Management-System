"use client";

import React, { useState } from "react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { UPDATE_MY_NOTIFICATION_PREFERENCES } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
const NotificationPreferencesForm = ({ initialEmailNotifications }: { initialEmailNotifications: boolean }) => {
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    const next = !emailNotifications;
    setEmailNotifications(next); // optimistic
    setError("");
    setSaving(true);
    try {
      const client = await getClientGqlClient();
      await client.request(UPDATE_MY_NOTIFICATION_PREFERENCES, {
        input: { emailNotifications: next },
      });
    } catch (err: any) {
      setEmailNotifications(!next); // revert on failure
      setError(
        getErrorMessage(err, "Failed to save. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-md font-semibold">Notifications</h2>
      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={emailNotifications}
          onChange={toggle}
          disabled={saving}
          className="w-4 h-4"
        />
        <span className="text-sm text-gray-600">Email me important updates (results, fees, notices)</span>
      </label>
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};

export default NotificationPreferencesForm;