"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { UPDATE_PROFILE } from "@/lib/graphql/queries";

const schema = z.object({
  name: z.string().min(1, { message: "First name is required" }),
  surname: z.string().min(1, { message: "Last name is required" }),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

type Inputs = z.infer<typeof schema>;

const ProfileEditForm = ({
  data,
  onSuccess,
}: {
  data: { name: string; surname: string; phone?: string };
  onSuccess: (updated: { name: string; surname: string; phone?: string }) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data.name,
      surname: data.surname,
      phone: data.phone ?? "",
    },
  });

  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      const result = await client.request<{
        updateProfile: { name: string; surname: string; phone?: string };
      }>(UPDATE_PROFILE, { input: formData });
      setSuccess(true);
      onSuccess(result.updateProfile);
    } catch (err: any) {
      setSubmitError(
        err?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="First name" name="name" register={register} error={errors.name} />
        <InputField label="Last name" name="surname" register={register} error={errors.surname} />
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
          inputProps={{ placeholder: "e.g. +8801XXXXXXXXX" }}
        />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}
      {success && <span className="text-green-600 text-sm">Profile updated.</span>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-brandPurple text-white px-6 py-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
};

export default ProfileEditForm;