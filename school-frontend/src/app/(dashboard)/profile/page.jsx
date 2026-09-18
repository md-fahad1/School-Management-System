"use client";

import { useEffect, useState } from "react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { GET_ME } from "@/lib/graphql/queries";
import AvatarUploader from "@/components/AvatarUploader";
import ProfileEditForm from "@/components/forms/ProfileEditForm";

const ProfilePage = () => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const client = await getClientGqlClient();
        const data = await client.request(GET_ME);
        setMe(data.me);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Couldn't load your profile. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="p-4 md:p-6 text-sm text-textMuted">Loading profile…</div>;
  }

  if (error || !me) {
    return <div className="p-4 md:p-6 text-sm text-danger">{error || "Profile not found."}</div>;
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-textPrimary">My Profile</h1>

      <div className="bg-cardBg border border-border rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-8">
        <AvatarUploader
          img={me.img}
          name={`${me.name} ${me.surname}`}
          onUpdated={(img) => setMe((prev) => ({ ...prev, img }))}
        />

        <div className="flex-1 flex flex-col gap-1">
          <div className="text-lg font-semibold text-textPrimary">
            {me.name} {me.surname}
          </div>
          <div className="text-sm text-accent capitalize font-medium">{me.role.toLowerCase()}</div>
          <div className="text-sm text-textMuted mt-2">@{me.username}</div>
          <div className="text-sm text-textMuted">{me.email}</div>
        </div>
      </div>

      <div className="bg-cardBg border border-border rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-textSecondary mb-4">Edit details</h2>
        <ProfileEditForm
          data={{ name: me.name, surname: me.surname, phone: me.phone }}
          onSuccess={(updated) => setMe((prev) => ({ ...prev, ...updated }))}
        />
      </div>
    </div>
  );
};

export default ProfilePage;