"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { APPLY_LEAVE } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

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
        getErrorMessage(err, "Something went wrong. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Apply for leave</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Leave type</label>
          <select
            {...register("leaveType")}
            className="field"
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
            className="field"
          />
          {errors.reason?.message && (
            <p className="text-xs text-danger">{errors.reason.message.toString()}</p>
          )}
        </div>
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary sm:self-end sm:px-8"
      >
        {submitting ? "Submitting..." : "Submit leave request"}
      </button>
    </form>
  );
};

export default LeaveApplyForm;