"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_STUDENTS, GET_LESSONS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const CREATE_ATTENDANCE = gql`
  mutation CreateAttendance($input: CreateAttendanceInput!) {
    createAttendance(input: $input) {
      id
    }
  }
`;

const UPDATE_ATTENDANCE = gql`
  mutation UpdateAttendance($id: ID!, $input: UpdateAttendanceInput!) {
    updateAttendance(id: $id, input: $input) {
      id
    }
  }
`;

const schema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  present: z.enum(["true", "false"]),
  studentId: z.string().min(1, { message: "Student is required" }),
  lessonId: z.string().min(1, { message: "Lesson is required" }),
});

type Inputs = z.infer<typeof schema>;

type LessonOption = {
  id: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
};

const AttendanceForm = ({
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
      present: data?.present === false ? "false" : "true",
      studentId: data?.studentId ?? "",
      lessonId: data?.lessonId ?? "",
    },
  });

  const [studentOptions, setStudentOptions] = useState<{ id: string; name: string }[]>([]);
  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const [students, lessons] = await Promise.all([
          client.request<{ students: { id: string; name: string }[] }>(GET_STUDENTS, { take: 500 }),
          client.request<{ lessons: LessonOption[] }>(GET_LESSONS, { take: 200 }),
        ]);
        setStudentOptions(students.students);
        setLessonOptions(lessons.lessons);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      const input = {
        ...formData,
        present: formData.present === "true",
        date: new Date(formData.date).toISOString(),
      };
      if (type === "create") {
        await client.request(CREATE_ATTENDANCE, { input });
      } else {
        await client.request(UPDATE_ATTENDANCE, { id: data.id, input });
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
        {type === "create" ? "Mark attendance" : "Update attendance"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Date"
          name="date"
          type="date"
          register={register}
          error={errors.date}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Status</label>
          <select
            {...register("present")}
            className="field"
          >
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Student</label>
          <select
            {...register("studentId")}
            className="field"
          >
            <option value="">Select a student</option>
            {studentOptions.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-danger">{errors.studentId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Lesson</label>
          <select
            {...register("lessonId")}
            className="field"
          >
            <option value="">Select a lesson</option>
            {lessonOptions.map((l) => (
              <option value={l.id} key={l.id}>
                {l.subjectName} — {l.className} ({l.teacherName})
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-danger">{errors.lessonId.message.toString()}</p>
          )}
        </div>
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary sm:self-end sm:px-8"
      >
        {submitting ? "Saving..." : type === "create" ? "Save" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm;