"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { GET_ME } from "@/lib/graphql/queries";

const WelcomeCard = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatarImg, setAvatarImg] = useState(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const client = await getClientGqlClient();
        const data = await client.request(GET_ME);
        setName(`${data.me.name} ${data.me.surname}`.trim());
        setRole(data.me.role);
        setAvatarImg(data.me.img ?? null);
      } catch (err) {
        console.error("Failed to load profile for welcome card:", err);
      }
    };
    loadMe();
  }, []);

  return (
    <div className="bg-cardBg rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
      <Image
        src={avatarImg || "/avatar.png"}
        alt=""
        width={56}
        height={56}
        className="rounded-full ring-2 ring-primaryLight w-14 h-14 object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-textMuted">Welcome back!</p>
        <h2 className="text-base font-semibold text-textPrimary truncate">
          {name || "..."}
        </h2>
        <p className="text-xs text-textSecondary capitalize">{role}</p>
      </div>
      <Link
        href="/profile"
        className="hidden sm:inline-flex items-center text-xs font-medium text-white bg-primary hover:bg-primaryDark px-3 py-2 rounded-lg transition-colors shrink-0"
      >
        View Profile
      </Link>
    </div>
  );
};

export default WelcomeCard;