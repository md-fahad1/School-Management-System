"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_SCHOLARSHIP, GET_STUDENT_OPTIONS } from "@/lib/graphql/queries";

const schema = z.object({
  studentId: z.string().min(1, { message: "Select a student" }),
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().min(0, { message: "Value must be 0 or more" }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const ScholarshipForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema), defaultValues: { type: "PERCENTAGE" } });

  const [students, setStudents] = useState<
    { id: string; name: string; surname: string; className: string }[]
  >([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const res = await client.request<{ students: any[] }>(GET_STUDENT_OPTIONS);
        setStudents(res.students);
      } catch (err) {
        console.error("Failed to load students:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(CREATE_SCHOLARSHIP, {
        input: {
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
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
      <h1 className="text-xl font-semibold">Grant a scholarship</h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[45%]">
          <label className="text-xs text-textMuted">Student</label>
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

        <InputField label="Scholarship name" name="name" register={register} error={errors.name} />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
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

        <InputField
          label="Start date (optional)"
          name="startDate"
          type="date"
          register={register}
          error={errors.startDate}
        />
        <InputField
          label="End date (optional)"
          name="endDate"
          type="date"
          register={register}
          error={errors.endDate}
        />
        <InputField label="Notes (optional)" name="notes" register={register} error={errors.notes} />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Grant scholarship"}
      </button>
    </form>
  );
};

export default ScholarshipForm;