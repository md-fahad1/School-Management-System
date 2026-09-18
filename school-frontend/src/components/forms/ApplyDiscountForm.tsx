"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { APPLY_INVOICE_DISCOUNT } from "@/lib/graphql/queries";

const schema = z.object({
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().min(0, { message: "Value must be 0 or more" }),
  reason: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const ApplyDiscountForm = ({
  invoiceId,
  amount,
  onSuccess,
}: {
  invoiceId: string;
  amount: number;
  onSuccess: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema), defaultValues: { type: "PERCENTAGE" } });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(APPLY_INVOICE_DISCOUNT, { invoiceId, input: formData });
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
      <h1 className="text-xl font-semibold">Apply a discount</h1>
      <p className="text-sm text-gray-500">Invoice amount: ${amount.toFixed(2)}</p>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-textMuted">Type</label>
          <select
            {...register("type")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed amount</option>
          </select>
        </div>

        <InputField
          label="Value"
          name="value"
          type="number"
          register={register}
          error={errors.value}
          inputProps={{ step: "0.01" }}
        />

        <InputField label="Reason (optional)" name="reason" register={register} error={errors.reason} />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Applying..." : "Apply discount"}
      </button>
    </form>
  );
};

export default ApplyDiscountForm;