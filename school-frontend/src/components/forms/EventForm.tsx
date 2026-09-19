"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_CLASSES } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
    }
  }
`;

const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
    }
  }
`;

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  classId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const EventForm = ({
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
      title: data?.title ?? "",
      description: data?.description ?? "",
    },
  });

  const [classOptions, setClassOptions] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const result = await client.request<{ classes: { id: string; name: string }[] }>(
          GET_CLASSES,
          { take: 200 }
        );
        setClassOptions(result.classes);
      } catch (err) {
        console.error("Failed to load class options:", err);
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
        classId: formData.classId || undefined,
      };
      if (type === "create") {
        await client.request(CREATE_EVENT, { input });
      } else {
        await client.request(UPDATE_EVENT, { id: data.id, input });
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
        {type === "create" ? "Create a new event" : "Update event"}
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
          <label className="text-xs text-textMuted">Class (optional)</label>
          <select
            {...register("classId")}
            className="field"
          >
            <option value="">School-wide (all classes)</option>
            {classOptions.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-textMuted">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="field"
          />
          {errors.description?.message && (
            <p className="text-xs text-danger">{errors.description.message.toString()}</p>
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

export default EventForm;