"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import {
  GENERATE_INVOICE,
  GET_STUDENT_OPTIONS,
  GET_FEE_STRUCTURE_OPTIONS,
} from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  studentId: z.string().min(1, { message: "Select a student" }),
  feeStructureId: z.string().optional(),
  period: z.string().min(1, { message: "Period is required" }),
  amount: z.coerce.number().optional(),
  dueDate: z.string().min(1, { message: "Due date is required" }),
});

type Inputs = z.infer<typeof schema>;

const GenerateInvoiceForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const [students, setStudents] = useState<{ id: string; name: string; surname: string; className: string }[]>([]);
  const [feeStructures, setFeeStructures] = useState<{ id: string; name: string; amount: number }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const [studentRes, feeRes] = await Promise.all([
          client.request<{ students: any[] }>(GET_STUDENT_OPTIONS),
          client.request<{ feeStructures: any[] }>(GET_FEE_STRUCTURE_OPTIONS, {}),
        ]);
        setStudents(studentRes.students);
        setFeeStructures(feeRes.feeStructures);
      } catch (err) {
        console.error("Failed to load invoice options:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(GENERATE_INVOICE, {
        input: {
          studentId: formData.studentId,
          feeStructureId: formData.feeStructureId || undefined,
          period: formData.period,
          amount: formData.amount || undefined,
          dueDate: new Date(formData.dueDate).toISOString(),
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
      <h1 className="text-xl font-semibold">Generate an invoice</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Student</label>
          <select
            {...register("studentId")}
            className="field"
            defaultValue=""
          >
            <option value="" disabled>
              Select a student
            </option>
            {students.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name} {s.surname} ({s.className})
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-danger">{errors.studentId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Fee structure (optional)</label>
          <select
            {...register("feeStructureId")}
            className="field"
            defaultValue=""
          >
            <option value="">Custom amount</option>
            {feeStructures.map((f) => (
              <option value={f.id} key={f.id}>
                {f.name} (${f.amount})
              </option>
            ))}
          </select>
        </div>

        <InputField label="Period" name="period" register={register} error={errors.period} />
        <InputField
          label="Amount (if no fee structure)"
          name="amount"
          type="number"
          register={register}
          error={errors.amount}
        />
        <InputField
          label="Due date"
          name="dueDate"
          type="date"
          register={register}
          error={errors.dueDate}
        />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary sm:self-end sm:px-8"
      >
        {submitting ? "Generating..." : "Generate invoice"}
      </button>
    </form>
  );
};

export default GenerateInvoiceForm;