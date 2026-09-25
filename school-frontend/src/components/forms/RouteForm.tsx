"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_ROUTE, UPDATE_ROUTE } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  name: z.string().min(1, { message: "Route name is required" }),
  description: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const RouteForm = ({
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
      description: data?.description ?? "",
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
        await client.request(CREATE_ROUTE, { input: formData });
      } else {
        await client.request(UPDATE_ROUTE, { id: data.id, input: formData });
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
        {type === "create" ? "Add a new route" : "Update route"}
      </h1>

      <div className="grid grid-cols-1 gap-4">
        <InputField label="Route name" name="name" register={register} error={errors.name} />
        <InputField label="Description" name="description" register={register} error={(errors as any).description} />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button type="submit" disabled={submitting} className="btn-primary sm:self-end sm:px-8">
        {submitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default RouteForm;