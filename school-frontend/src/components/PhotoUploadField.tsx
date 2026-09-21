"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FaCamera } from "react-icons/fa";
import {
  uploadToCloudinary,
  MAX_AVATAR_SIZE_BYTES,
  ACCEPTED_AVATAR_TYPES,
} from "@/lib/cloudinary";

/**
 * Same Cloudinary direct-upload flow as AvatarUploader (see
 * src/components/AvatarUploader.tsx), but generic: instead of saving the
 * result itself via UPDATE_AVATAR, it just reports the resulting URL back
 * to the parent form through onChange. Drop this into any react-hook-form
 * (student, teacher, ...) and wire it to the form's `img` field.
 */
const PhotoUploadField = ({
  label = "Photo",
  value,
  onChange,
}: {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const displaySrc = preview || value || "";

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
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
      onChange(secureUrl);
    } catch (err) {
      console.error("Photo upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs text-textMuted">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 shrink-0">
          {displaySrc ? (
            displaySrc.startsWith("blob:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displaySrc}
                alt={label}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <Image
                src={displaySrc}
                alt={label}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-border"
              />
            )
          ) : (
            <div className="w-16 h-16 rounded-full bg-brandPurple/10 text-brandPurple flex items-center justify-center ring-2 ring-border">
              <FaCamera size={16} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="text-xs text-brandPurple hover:underline disabled:opacity-60 text-left"
          >
            {uploading ? `Uploading… ${progress}%` : displaySrc ? "Change photo" : "Upload photo"}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_AVATAR_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PhotoUploadField;