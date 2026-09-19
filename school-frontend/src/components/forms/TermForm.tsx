"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { ADD_TERM } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { toInputDate } from "@/lib/academic";

// The backend has no "update term" mutation: to change a term, delete and re-add it.
// data = { academicYearId, yearName, yearStart, yearEnd }
const TermForm = ({
  data,
  onSuccess,
}: {
  type?: "create" | "update";
  data?: any;
  onSuccess: () => void;
}) => {
  const yearStart = toInputDate(data?.yearStart);
  const yearEnd = toInputDate(data?.yearEnd);

  const schema = z
    .object({
      name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
      type: z.enum(["TERM", "SEMESTER", "TRIMESTER"]),
      startDate: z.string().min(1, { message: "Start date is required" }),
      endDate: z.string().min(1, { message: "End date is required" }),
    })
    .superRefine((v, ctx) => {
      if (v.startDate && v.endDate && v.endDate <= v.startDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be after the start date" });
      }
      if (v.startDate && yearStart && v.startDate < yearStart) {
        ctx.addIssue({ code: "custom", path: ["startDate"], message: "Must be inside the academic year" });
      }
      if (v.endDate && yearEnd && v.endDate > yearEnd) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "Must be inside the academic year" });
      }
    });

  type Inputs = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "SEMESTER", startDate: yearStart, endDate: "" },
  });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(ADD_TERM, { input: { academicYearId: data.academicYearId, ...formData } });
      onSuccess();
    } catch (err: any) {
      setSubmitError(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <div>
        <h1 className="text-xl font-semibold">Add a term</h1>
        {data?.yearName && (
          <p className="text-sm text-textMuted mt-1">
            Inside academic year <b className="text-textPrimary">{data.yearName}</b>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Name" name="name" register={register} error={errors.name} hint='For example "1st Semester"' />

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="field-termType" className="text-xs font-medium text-textSecondary">Type</label>
          <select id="field-termType" {...register("type")} className="field">
            <option value="TERM">Term</option>
            <option value="SEMESTER">Semester</option>
            <option value="TRIMESTER">Trimester</option>
          </select>
        </div>

        <InputField
          label="Start date" name="startDate" type="date" register={register} error={errors.startDate}
          inputProps={{ min: yearStart || undefined, max: yearEnd || undefined }}
        />
        <InputField
          label="End date" name="endDate" type="date" register={register} error={errors.endDate}
          inputProps={{ min: yearStart || undefined, max: yearEnd || undefined }}
        />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button type="submit" disabled={submitting} className="btn-primary sm:self-end sm:px-8">
        {submitting ? "Saving..." : "Add term"}
      </button>
    </form>
  );
};

export default TermForm;