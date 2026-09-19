"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_DEPARTMENT, UPDATE_DEPARTMENT } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  code: z.string().trim().max(20, { message: "Keep the code short (20 characters max)" }).optional(),
  type: z.enum(["GROUP", "DEPARTMENT"]),
  description: z.string().trim().max(300, { message: "300 characters max" }).optional(),
});

type Inputs = z.infer<typeof schema>;

const DepartmentForm = ({
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
      code: data?.code ?? "",
      type: data?.type ?? "DEPARTMENT",
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
      // Empty optional boxes go as null so an edit can clear them.
      const input = {
        name: formData.name,
        type: formData.type,
        code: formData.code?.trim() || null,
        description: formData.description?.trim() || null,
      };
      if (type === "create") {
        await client.request(CREATE_DEPARTMENT, { input });
      } else {
        await client.request(UPDATE_DEPARTMENT, { id: data.id, input });
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
        {type === "create" ? "Add a new department / group" : "Update department / group"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Name" name="name" register={register} error={errors.name} hint='For example "Science" or "CSE"' />
        <InputField label="Code (optional)" name="code" register={register} error={errors.code} hint='For example "SCI"' />

        <div className="flex flex-col gap-1.5 w-full sm:col-span-2">
          <label htmlFor="field-deptType" className="text-xs font-medium text-textSecondary">Type</label>
          <select id="field-deptType" {...register("type")} className="field">
            <option value="DEPARTMENT">Department (college, e.g. CSE, Physics)</option>
            <option value="GROUP">Group (school, e.g. Science, Humanities)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:col-span-2">
          <label htmlFor="field-deptDesc" className="text-xs font-medium text-textSecondary">Description (optional)</label>
          <textarea
            id="field-deptDesc"
            rows={3}
            {...register("description")}
            className={`field ${errors.description ? "field-error" : ""}`}
          />
          {errors.description?.message && (
            <p className="text-xs text-danger">{errors.description.message.toString()}</p>
          )}
        </div>
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button type="submit" disabled={submitting} className="btn-primary sm:self-end sm:px-8">
        {submitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default DepartmentForm;