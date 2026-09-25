"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_STOP, UPDATE_STOP } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  routeId: z.string().min(1),
  name: z.string().min(1, { message: "Stop name is required" }),
  order: z.coerce.number().optional(),
  time: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const StopForm = ({
  type,
  data,
  routeId,
  onSuccess,
}: {
  type: "create" | "update";
  data?: any;
  routeId: string;
  onSuccess: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      routeId: data?.routeId ?? routeId,
      name: data?.name ?? "",
      order: data?.order ?? 0,
      time: data?.time ?? "",
    },
  });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      if (type === "create") {
        await client.request(CREATE_STOP, { input: formData });
      } else {
        await client.request(UPDATE_STOP, { id: data.id, input: formData });
      }
      onSuccess();
    } catch (err: any) {
      setSubmitError(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add a new stop" : "Update stop"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Stop name" name="name" register={register} error={errors.name} />
        <InputField label="Order" name="order" type="number" register={register} error={(errors as any).order} />
        <InputField label="Time (e.g. 7:30 AM)" name="time" register={register} error={(errors as any).time} />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button type="submit" disabled={submitting} className="btn-primary sm:self-end sm:px-8">
        {submitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StopForm;