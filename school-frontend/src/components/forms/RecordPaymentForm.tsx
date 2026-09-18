"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { RECORD_PAYMENT } from "@/lib/graphql/queries";

const schema = z.object({
  amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0" }),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "MOBILE_BANKING"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const RecordPaymentForm = ({
  invoiceId,
  balance,
  onSuccess,
}: {
  invoiceId: string;
  balance: number;
  onSuccess: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: { amount: balance, method: "CASH" },
  });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(RECORD_PAYMENT, {
        input: { invoiceId, ...formData },
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
      <h1 className="text-xl font-semibold">Record a payment</h1>
      <p className="text-sm text-gray-500">Remaining balance: ${balance.toFixed(2)}</p>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Amount"
          name="amount"
          type="number"
          register={register}
          error={errors.amount}
          inputProps={{ step: "0.01" }}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-textMuted">Method</label>
          <select
            {...register("method")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="MOBILE_BANKING">Mobile banking</option>
          </select>
        </div>

        <InputField
          label="Reference (optional)"
          name="reference"
          register={register}
          error={errors.reference}
        />
        <InputField label="Notes (optional)" name="notes" register={register} error={errors.notes} />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Recording..." : "Record payment"}
      </button>
    </form>
  );
};

export default RecordPaymentForm;