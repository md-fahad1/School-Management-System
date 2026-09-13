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
        err?.response?.errors?.[0]?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Generate an invoice</h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[45%]">
          <label className="text-xs text-gray-500">Student</label>
          <select
            {...register("studentId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
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
            <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[45%]">
          <label className="text-xs text-gray-500">Fee structure (optional)</label>
          <select
            {...register("feeStructureId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
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
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Generating..." : "Generate invoice"}
      </button>
    </form>
  );
};

export default GenerateInvoiceForm;