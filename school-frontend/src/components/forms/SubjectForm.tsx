"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_SUBJECT, UPDATE_SUBJECT, GET_TEACHER_OPTIONS } from "@/lib/graphql/queries";

const schema = z.object({
  name: z.string().min(2, { message: "Subject name must be at least 2 characters" }),
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
        err?.response?.errors?.[0]?.message ?? "Something went wrong. Please try again."
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

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          name="name"
          register={register}
          error={errors.name}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teachers</label>
          <select
            multiple
            {...register("teacherIds")}
            defaultValue={data?.teachers ?? []}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-24"
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
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;