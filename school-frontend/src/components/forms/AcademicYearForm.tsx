"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_ACADEMIC_YEAR, UPDATE_ACADEMIC_YEAR } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { toInputDate } from "@/lib/academic";

const schema = z
  .object({
    name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    isCurrent: z.boolean().optional(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate > v.startDate, {
    message: "End date must be after the start date",
    path: ["endDate"],
  });

type Inputs = z.infer<typeof schema>;

const AcademicYearForm = ({
  type,
  data,
  onSuccess,
}: {
  type: "create" | "update";
  data?: any;
  onSuccess: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.name ?? "",
      startDate: toInputDate(data?.startDate),
      endDate: toInputDate(data?.endDate),
      isCurrent: false,
    },
  });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      if (type === "create") {
        await client.request(CREATE_ACADEMIC_YEAR, {
          input: {
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isCurrent: !!formData.isCurrent,
          },
        });
      } else {
        // Backend's UpdateAcademicYearInput has no isCurrent field.
        await client.request(UPDATE_ACADEMIC_YEAR, {
          id: data.id,
          input: { name: formData.name, startDate: formData.startDate, endDate: formData.endDate },
        });
      }
      onSuccess();
    } catch (err: any) {
      setSubmitError(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add a new academic year" : "Update academic year"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField label="Name" name="name" register={register} error={errors.name} hint='For example "2026" or "2026-2027"' />
        </div>
        <InputField label="Start date" name="startDate" type="date" register={register} error={errors.startDate} />
        <InputField label="End date" name="endDate" type="date" register={register} error={errors.endDate} />

        {type === "create" && (
          <label className="sm:col-span-2 flex items-start gap-2 text-sm text-textSecondary">
            <input type="checkbox" {...register("isCurrent")} className="mt-0.5 h-4 w-4 accent-accent" />
            <span>
              Make this the <b className="text-textPrimary">current</b> academic year
              <span className="block text-xs text-textMuted">
                Only one year can be current. The previous one will be unmarked.
              </span>
            </span>
          </label>
        )}
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button type="submit" disabled={submitting} className="btn-primary sm:self-end sm:px-8">
        {submitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AcademicYearForm;