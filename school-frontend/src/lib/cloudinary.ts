"use client";

/**
 * Uploads a file straight from the browser to Cloudinary using an
 * unsigned upload preset — the image bytes never touch our backend,
 * only the resulting `secure_url` does (see UPDATE_AVATAR).
 *
 * Requires two env vars in frontend/.env:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your cloud name>
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<an unsigned upload preset>
 *
 * Create the preset in Cloudinary → Settings → Upload → Upload presets
 * → "Add upload preset" → Signing Mode: Unsigned.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and " +
        "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in frontend/.env"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "avatars");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data.secure_url as string);
        } else {
          reject(new Error(data?.error?.message || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed: invalid response from Cloudinary"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed: network error"));
    xhr.send(formData);
  });
}

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];