"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_LESSONS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const CREATE_EXAM = gql`
  mutation CreateExam($input: CreateExamInput!) {
    createExam(input: $input) {
      id
    }
  }
`;

const UPDATE_EXAM = gql`
  mutation UpdateExam($id: ID!, $input: UpdateExamInput!) {
    updateExam(id: $id, input: $input) {
      id
    }
  }
`;

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  lessonId: z.string().min(1, { message: "Lesson is required" }),
});

type Inputs = z.infer<typeof schema>;

type LessonOption = {
  id: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
};

const ExamForm = ({
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
      title: data?.subject ?? "",
    },
  });

  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const result = await client.request<{ lessons: LessonOption[] }>(GET_LESSONS, { take: 200 });
        setLessonOptions(result.lessons);
      } catch (err) {
        console.error("Failed to load lesson options:", err);
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
        await client.request(CREATE_EXAM, { input });
      } else {
        await client.request(UPDATE_EXAM, { id: data.id, input });
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
        {type === "create" ? "Create a new exam" : "Update exam"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Title" name="title" register={register} error={errors.title} />
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
        {submitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;