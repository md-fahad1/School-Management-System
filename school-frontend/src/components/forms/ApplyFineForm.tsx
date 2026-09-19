"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { APPLY_INVOICE_FINE } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  amount: z.coerce.number().min(0, { message: "Amount must be 0 or more" }),
  reason: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const ApplyFineForm = ({ invoiceId, onSuccess }: { invoiceId: string; onSuccess: () => void }) => {
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
      await client.request(APPLY_INVOICE_FINE, { invoiceId, input: formData });
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
      <h1 className="text-xl font-semibold">Apply a fine</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Fine amount"
          name="amount"
          type="number"
          register={register}
          error={errors.amount}
          inputProps={{ step: "0.01" }}
        />
        <InputField label="Reason (optional)" name="reason" register={register} error={errors.reason} />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary sm:self-end sm:px-8"
      >
        {submitting ? "Applying..." : "Apply fine"}
      </button>
    </form>
  );
};

export default ApplyFineForm;