"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { APPLY_LEAVE } from "@/lib/graphql/queries";

const schema = z.object({
  leaveType: z.enum(["SICK", "CASUAL", "EARNED", "MATERNITY", "PATERNITY", "OTHER"]),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  reason: z.string().min(3, { message: "Reason is required" }),
});

type Inputs = z.infer<typeof schema>;

const LeaveApplyForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(APPLY_LEAVE, {
        input: {
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
        },
      });
      onSuccess();
    } catch (err: any) {
      setSubmitError(
        err?.response?.errors?.[0]?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Apply for leave</h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[45%]">
          <label className="text-xs text-textMuted">Leave type</label>
          <select
            {...register("leaveType")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue="CASUAL"
          >
            <option value="SICK">Sick</option>
            <option value="CASUAL">Casual</option>
            <option value="EARNED">Earned</option>
            <option value="MATERNITY">Maternity</option>
            <option value="PATERNITY">Paternity</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <InputField label="Start date" name="startDate" type="date" register={register} error={errors.startDate} />
        <InputField label="End date" name="endDate" type="date" register={register} error={errors.endDate} />

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-textMuted">Reason</label>
          <textarea
            {...register("reason")}
            rows={3}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          />
          {errors.reason?.message && (
            <p className="text-xs text-red-400">{errors.reason.message.toString()}</p>
          )}
        </div>
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit leave request"}
      </button>
    </form>
  );
};

export default LeaveApplyForm;