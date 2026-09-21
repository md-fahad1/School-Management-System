"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_SUBJECT, UPDATE_SUBJECT, GET_TEACHER_OPTIONS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  name: z.string().min(2, { message: "Subject name must be at least 2 characters" }),
  code: z.string().optional(),
  type: z.enum(["THEORY", "PRACTICAL", "LAB"]).optional(),
  credit: z.coerce.number().optional(),
  isOptional: z.boolean().optional(),
  isFourthSubject: z.boolean().optional(),
  teacherIds: z.array(z.string()).optional(),
});

type Inputs = z.infer<typeof schema>;

const SubjectForm = ({
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
      code: data?.code && data.code !== "-" ? data.code : "",
      type: data?.type ?? "THEORY",
      credit: data?.credit ?? undefined,
      isOptional: data?.isOptional ?? false,
      isFourthSubject: data?.isFourthSubject ?? false,
      teacherIds: [],
    },
  });

  const [teacherOptions, setTeacherOptions] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Populate the multi-select with the full teacher list, fetched
  // client-side on mount — the list page that opened this modal
  // already fetched teachers server-side for its own table, but that
  // data isn't passed down here, so this form fetches its own copy.
  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const result = await client.request<{ teachers: { id: string; name: string }[] }>(
          GET_TEACHER_OPTIONS
        );
        setTeacherOptions(result.teachers);
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
      if (type === "create") {
        await client.request(CREATE_SUBJECT, { input: formData });
      } else {
        await client.request(UPDATE_SUBJECT, { id: data.id, input: formData });
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
        {type === "create" ? "Create a new subject" : "Update subject"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Subject name"
          name="name"
          register={register}
          error={errors.name}
        />
        <InputField
          label="Subject code"
          name="code"
          register={register}
          error={(errors as any).code}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Type</label>
          <select {...register("type")} className="field">
            <option value="THEORY">Theory</option>
            <option value="PRACTICAL">Practical</option>
            <option value="LAB">Lab</option>
          </select>
        </div>

        <InputField
          label="Credit"
          name="credit"
          type="number"
          register={register}
          error={(errors as any).credit}
        />

        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="isOptional" {...register("isOptional")} className="h-4 w-4" />
          <label htmlFor="isOptional" className="text-sm text-textSecondary">
            Optional subject
          </label>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="isFourthSubject" {...register("isFourthSubject")} className="h-4 w-4" />
          <label htmlFor="isFourthSubject" className="text-sm text-textSecondary">
            4th subject
          </label>
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:col-span-2">
          <label className="text-xs text-textMuted">Teachers</label>
          <select
            multiple
            {...register("teacherIds")}
            defaultValue={data?.teachers ?? []}
            className="field h-24"
          >
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

export default SubjectForm;