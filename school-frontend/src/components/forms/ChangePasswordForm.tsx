"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CHANGE_PASSWORD } from "@/lib/graphql/queries";
import { performLogout } from "@/lib/auth/logout";

const schema = z
  .object({
    currentPassword: z.string().min(1, { message: "Enter your current password" }),
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters" })
      .regex(/[a-zA-Z]/, { message: "Must contain at least one letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Inputs = z.infer<typeof schema>;

const ChangePasswordForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(CHANGE_PASSWORD, {
        input: {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
      });

      // Password change revokes every session server-side (including
      // this one's refresh token), so send the user back to sign in
      // with their new password instead of leaving a dead session up.
      reset();
      await performLogout();
      router.push("/signin?passwordChanged=1");
    } catch (err: any) {
      setSubmitError(
        err?.response?.errors?.[0]?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h2 className="text-md font-semibold">Change password</h2>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Current password"
          name="currentPassword"
          type="password"
          register={register}
          error={errors.currentPassword}
        />
        <InputField
          label="New password"
          name="newPassword"
          type="password"
          register={register}
          error={errors.newPassword}
        />
        <InputField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          register={register}
          error={errors.confirmPassword}
        />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60 w-fit px-6"
      >
        {submitting ? "Updating..." : "Update password"}
      </button>
      <p className="text-xs text-gray-400">
        Changing your password signs you out of every device — you&apos;ll need to log back in.
      </p>
    </form>
  );
};

export default ChangePasswordForm;