"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_STUDENTS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const CREATE_RESULT = gql`
  mutation CreateResult($input: CreateResultInput!) {
    createResult(input: $input) {
      id
    }
  }
`;

const UPDATE_RESULT = gql`
  mutation UpdateResult($id: ID!, $input: UpdateResultInput!) {
    updateResult(id: $id, input: $input) {
      id
    }
  }
`;

// The backend's exams/assignments queries don't take a search/limit
// shape matching GET_LESSONS' pattern for a combined picker, so this
// form asks for a raw ID directly rather than a friendly dropdown —
// simplest correct option given exams and assignments aren't unified
// in one query. Worth revisiting with a proper picker once exam/
// assignment list pages expose "copy ID" or a combined lookup.
const schema = z
  .object({
    score: z.coerce.number().min(0, { message: "Score must be 0 or higher" }).max(100, {
      message: "Score must be 100 or lower",
    }),
    studentId: z.string().min(1, { message: "Student is required" }),
    resultType: z.enum(["exam", "assignment"]),
    examId: z.string().optional(),
    assignmentId: z.string().optional(),
  })
  .refine(
    (val) => (val.resultType === "exam" ? !!val.examId : !!val.assignmentId),
    { message: "Enter the exam or assignment ID", path: ["examId"] }
  );

type Inputs = z.infer<typeof schema>;

const ResultForm = ({
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
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      score: data?.score ?? undefined,
      resultType: data?.type === "assignment" ? "assignment" : "exam",
    },
  });

  const resultType = watch("resultType");

  const [studentOptions, setStudentOptions] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const result = await client.request<{ students: { id: string; name: string }[] }>(
          GET_STUDENTS,
          { take: 500 }
        );
        setStudentOptions(result.students);
      } catch (err) {
        console.error("Failed to load student options:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      const input = {
        score: formData.score,
        studentId: formData.studentId,
        examId: formData.resultType === "exam" ? formData.examId : undefined,
        assignmentId: formData.resultType === "assignment" ? formData.assignmentId : undefined,
      };
      if (type === "create") {
        await client.request(CREATE_RESULT, { input });
      } else {
        await client.request(UPDATE_RESULT, { id: data.id, input });
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
        {type === "create" ? "Enter a result" : "Update result"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Score (0-100)"
          name="score"
          type="number"
          register={register}
          error={errors.score}
        />

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
          <label className="text-xs text-textMuted">This result is for a...</label>
          <select
            {...register("resultType")}
            className="field"
          >
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>

        {resultType === "exam" ? (
          <InputField
            label="Exam ID"
            name="examId"
            register={register}
            error={errors.examId}
          />
        ) : (
          <InputField
            label="Assignment ID"
            name="assignmentId"
            register={register}
            error={errors.assignmentId}
          />
        )}
      </div>

      <p className="text-xs text-gray-400">
        Tip: open the Exams or Assignments list in another tab to find the ID you need.
      </p>

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

export default ResultForm;