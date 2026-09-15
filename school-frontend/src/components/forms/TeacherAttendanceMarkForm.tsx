"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { GET_TEACHER_ATTENDANCE_OPTIONS, MARK_TEACHER_ATTENDANCE } from "@/lib/graphql/queries";

const schema = z.object({
  teacherId: z.string().min(1, { message: "Select a teacher" }),
  date: z.string().min(1, { message: "Date is required" }),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EARLY_LEAVE", "ON_LEAVE"]),
  remarks: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const TeacherAttendanceMarkForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const [teacherOptions, setTeacherOptions] = useState<
    { id: string; name: string; surname: string }[]
  >([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const data = await client.request<{
          teachers: { id: string; name: string; surname: string }[];
        }>(GET_TEACHER_ATTENDANCE_OPTIONS);
        setTeacherOptions(data.teachers);
      } catch (err) {
        console.error("Failed to load teacher options:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(MARK_TEACHER_ATTENDANCE, {
        input: {
          teacherId: formData.teacherId,
          date: formData.date,
          status: formData.status,
          remarks: formData.remarks || undefined,
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
      <h1 className="text-xl font-semibold">Mark teacher attendance</h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[45%]">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            {...register("teacherId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue=""
          >
            <option value="" disabled>
              Select a teacher
            </option>
            {teacherOptions.map((t) => (
              <option value={t.id} key={t.id}>
                {t.name} {t.surname}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">{errors.teacherId.message.toString()}</p>
          )}
        </div>

        <InputField label="Date" name="date" type="date" register={register} error={errors.date} />

        <div className="flex flex-col gap-2 w-full md:w-[45%]">
          <label className="text-xs text-gray-500">Status</label>
          <select
            {...register("status")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue="PRESENT"
          >
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="EARLY_LEAVE">Early leave</option>
            <option value="ON_LEAVE">On leave</option>
          </select>
        </div>

        <InputField label="Remarks (optional)" name="remarks" register={register} error={errors.remarks} />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save attendance"}
      </button>
    </form>
  );
};

export default TeacherAttendanceMarkForm;