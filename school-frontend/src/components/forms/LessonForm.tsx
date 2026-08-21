"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "graphql-request";
import { GET_SUBJECTS, GET_CLASSES, GET_TEACHER_OPTIONS } from "@/lib/graphql/queries";

const CREATE_LESSON = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
      id
    }
  }
`;

const UPDATE_LESSON = gql`
  mutation UpdateLesson($id: ID!, $input: UpdateLessonInput!) {
    updateLesson(id: $id, input: $input) {
      id
    }
  }
`;

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

const schema = z.object({
  name: z.string().min(1, { message: "Lesson name is required" }),
  day: z.enum(DAYS, { errorMap: () => ({ message: "Select a day" }) }),
  // datetime-local inputs give "YYYY-MM-DDTHH:mm" — the backend's
  // @IsDateString() accepts that directly, no conversion needed.
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  subjectId: z.string().min(1, { message: "Subject is required" }),
  classId: z.string().min(1, { message: "Class is required" }),
  teacherId: z.string().min(1, { message: "Teacher is required" }),
});

type Inputs = z.infer<typeof schema>;

const LessonForm = ({
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
    },
  });

  const [subjectOptions, setSubjectOptions] = useState<{ id: string; name: string }[]>([]);
  const [classOptions, setClassOptions] = useState<{ id: string; name: string }[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const [subjects, classes, teachers] = await Promise.all([
          client.request<{ subjects: { id: string; name: string }[] }>(GET_SUBJECTS, { take: 200 }),
          client.request<{ classes: { id: string; name: string }[] }>(GET_CLASSES, { take: 200 }),
          client.request<{ teachers: { id: string; name: string }[] }>(GET_TEACHER_OPTIONS),
        ]);
        setSubjectOptions(subjects.subjects);
        setClassOptions(classes.classes);
        setTeacherOptions(teachers.teachers);
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
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };
      if (type === "create") {
        await client.request(CREATE_LESSON, { input });
      } else {
        await client.request(UPDATE_LESSON, { id: data.id, input });
      }
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
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new lesson" : "Update lesson"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Lesson name" name="name" register={register} error={errors.name} />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          <select
            {...register("day")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select a day</option>
            {DAYS.map((d) => (
              <option value={d} key={d}>
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.day?.message && (
            <p className="text-xs text-red-400">{errors.day.message.toString()}</p>
          )}
        </div>

        <InputField
          label="Start time"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime}
        />
        <InputField
          label="End time"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            {...register("subjectId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select a subject</option>
            {subjectOptions.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">{errors.subjectId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            {...register("classId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select a class</option>
            {classOptions.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            {...register("teacherId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select a teacher</option>
            {teacherOptions.map((t) => (
              <option value={t.id} key={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">{errors.teacherId.message.toString()}</p>
          )}
        </div>
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default LessonForm;