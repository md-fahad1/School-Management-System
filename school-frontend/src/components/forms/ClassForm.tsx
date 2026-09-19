"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_GRADES, GET_TEACHER_OPTIONS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const CREATE_CLASS = gql`
  mutation CreateClass($input: CreateClassInput!) {
    createClass(input: $input) {
      id
    }
  }
`;

const UPDATE_CLASS = gql`
  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {
    updateClass(id: $id, input: $input) {
      id
    }
  }
`;

const schema = z.object({
  name: z.string().min(1, { message: "Class name is required" }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1" }),
  gradeId: z.string().min(1, { message: "Grade is required" }),
  supervisorId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const ClassForm = ({
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
      capacity: data?.capacity ?? undefined,
    },
  });

  const [gradeOptions, setGradeOptions] = useState<{ id: string; level: number }[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const [grades, teachers] = await Promise.all([
          client.request<{ grades: { id: string; level: number }[] }>(GET_GRADES),
          client.request<{ teachers: { id: string; name: string }[] }>(GET_TEACHER_OPTIONS),
        ]);
        setGradeOptions(grades.grades);
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
      // supervisorId is optional — send undefined rather than an empty
      // string if nothing was picked, so the backend treats it as unset.
      const input = {
        ...formData,
        supervisorId: formData.supervisorId || undefined,
      };
      if (type === "create") {
        await client.request(CREATE_CLASS, { input });
      } else {
        await client.request(UPDATE_CLASS, { id: data.id, input });
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
        {type === "create" ? "Create a new class" : "Update class"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Class name" name="name" register={register} error={errors.name} />
        <InputField
          label="Capacity"
          name="capacity"
          type="number"
          register={register}
          error={errors.capacity}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Grade</label>
          <select
            {...register("gradeId")}
            className="field"
          >
            <option value="">Select a grade</option>
            {gradeOptions.map((g) => (
              <option value={g.id} key={g.id}>
                Grade {g.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-danger">{errors.gradeId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Supervisor (optional)</label>
          <select
            {...register("supervisorId")}
            className="field"
          >
            <option value="">No supervisor</option>
            {teacherOptions.map((t) => (
              <option value={t.id} key={t.id}>
                {t.name}
              </option>
            ))}
          </select>
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

export default ClassForm;