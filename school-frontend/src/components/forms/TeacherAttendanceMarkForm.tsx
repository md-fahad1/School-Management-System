"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { GET_TEACHER_ATTENDANCE_OPTIONS, MARK_TEACHER_ATTENDANCE } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

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
        getErrorMessage(err, "Something went wrong. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Mark teacher attendance</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Teacher</label>
          <select
            {...register("teacherId")}
            className="field"
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
            <p className="text-xs text-danger">{errors.teacherId.message.toString()}</p>
          )}
        </div>

        <InputField label="Date" name="date" type="date" register={register} error={errors.date} />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Status</label>
          <select
            {...register("status")}
            className="field"
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
        className="btn-primary sm:self-end sm:px-8"
      >
        {submitting ? "Saving..." : "Save attendance"}
      </button>
    </form>
  );
};

export default TeacherAttendanceMarkForm;