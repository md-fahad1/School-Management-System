"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_FEE_STRUCTURE, UPDATE_FEE_STRUCTURE, GET_GRADES } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.coerce.number().min(0, { message: "Amount must be 0 or more" }),
  frequency: z.enum(["MONTHLY", "TERM", "YEARLY", "ONE_TIME"]),
  gradeId: z.string().min(1, { message: "Select a grade" }),
});

type Inputs = z.infer<typeof schema>;

const FeeStructureForm = ({
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
      amount: data?.amount ?? 0,
      frequency: data?.frequency ?? "TERM",
      gradeId: data?.gradeId ?? "",
    },
  });

  const [grades, setGrades] = useState<{ id: string; level: number }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const res = await client.request<{ grades: { id: string; level: number }[] }>(GET_GRADES);
        setGrades(res.grades);
      } catch (err) {
        console.error("Failed to load grades:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      if (type === "create") {
        await client.request(CREATE_FEE_STRUCTURE, { input: formData });
      } else {
        await client.request(UPDATE_FEE_STRUCTURE, { id: data.id, input: formData });
      }
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
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add a fee structure" : "Update fee structure"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Name" name="name" register={register} error={errors.name} />
        <InputField
          label="Amount"
          name="amount"
          type="number"
          register={register}
          error={errors.amount}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Frequency</label>
          <select
            {...register("frequency")}
            className="field"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="TERM">Term</option>
            <option value="YEARLY">Yearly</option>
            <option value="ONE_TIME">One-time</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Grade</label>
          <select
            {...register("gradeId")}
            className="field"
            defaultValue=""
          >
            <option value="" disabled>
              Select a grade
            </option>
            {grades.map((g) => (
              <option value={g.id} key={g.id}>
                Grade {g.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-danger">{errors.gradeId.message.toString()}</p>
          )}
        </div>
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary sm:self-end sm:px-8"
      >
        {submitting ? "Saving..." : type === "create" ? "Add fee structure" : "Update"}
      </button>
    </form>
  );
};

export default FeeStructureForm;