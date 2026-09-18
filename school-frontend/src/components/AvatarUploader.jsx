"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FaCamera } from "react-icons/fa";
import { getClientGqlClient } from "@/lib/graphql/client";
import { UPDATE_AVATAR } from "@/lib/graphql/queries";
import {
  uploadToCloudinary,
  MAX_AVATAR_SIZE_BYTES,
  ACCEPTED_AVATAR_TYPES,
} from "@/lib/cloudinary";

// `img` is the current avatar URL (or null). `onUpdated(url)` fires once
// the new photo is uploaded to Cloudinary *and* saved on the account, so
// the parent can update whatever it's showing (navbar, profile page, etc).
const AvatarUploader = ({ img, name, onUpdated }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const displaySrc = preview || img || "/avatar.png";
  const initials = (name || "?").trim().charAt(0).toUpperCase();

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setError("");

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError("Image is too large — please choose one under 5MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    setProgress(0);

    try {
      const secureUrl = await uploadToCloudinary(file, setProgress);
      const client = await getClientGqlClient();
      const data = await client.request(UPDATE_AVATAR, {
        input: { image: secureUrl },
      });
      onUpdated?.(data.updateAvatar.img);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        {displaySrc.startsWith("blob:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt="Profile photo"
            className="w-28 h-28 rounded-full object-cover ring-4 ring-lamaPurpleLight"
          />
        ) : img || preview ? (
          <Image
            src={displaySrc}
            alt="Profile photo"
            width={112}
            height={112}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-lamaPurpleLight"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-brandPurple text-white flex items-center justify-center text-3xl font-semibold ring-4 ring-lamaPurpleLight">
            {initials}
          </div>
        )}

        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          title="Change photo"
          className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-brandPurple text-white flex items-center justify-center shadow-md hover:bg-indigo-700 disabled:opacity-60"
        >
          <FaCamera size={14} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_AVATAR_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploading && (
        <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brandPurple transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500 text-center max-w-[220px]">{error}</p>}

      <button
        type="button"
        onClick={handlePick}
        disabled={uploading}
        className="text-xs text-brandPurple hover:underline disabled:opacity-60"
      >
        {uploading ? `Uploading… ${progress}%` : "Change photo"}
      </button>
    </div>
  );
};

export default AvatarUploader;