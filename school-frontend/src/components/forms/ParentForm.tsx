"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "graphql-request";

const CREATE_PARENT = gql`
  mutation CreateParent($input: CreateParentInput!) {
    createParent(input: $input) {
      id
    }
  }
`;

const UPDATE_PARENT = gql`
  mutation UpdateParent($id: ID!, $input: UpdateParentInput!) {
    updateParent(id: $id, input: $input) {
      id
    }
  }
`;

const createSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[a-zA-Z]/, { message: "Password needs at least one letter" })
    .regex(/[0-9]/, { message: "Password needs at least one number" }),
  name: z.string().min(1, { message: "First name is required" }),
  surname: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1, { message: "First name is required" }),
  surname: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const ParentForm = ({
  type,
  data,
  onSuccess,
}: {
  type: "create" | "update";
  data?: any;
  onSuccess: () => void;
}) => {
  const schema = type === "create" ? createSchema : updateSchema;
  type Inputs = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues:
      type === "update"
        ? {
            name: data?.name?.split(" ")[0] ?? "",
            surname: data?.name?.split(" ").slice(1).join(" ") ?? "",
            phone: data?.phone === "-" ? "" : data?.phone,
            address: data?.address === "-" ? "" : data?.address,
          }
        : undefined,
  });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      if (type === "create") {
        await client.request(CREATE_PARENT, { input: formData });
      } else {
        await client.request(UPDATE_PARENT, { id: data.id, input: formData });
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
        {type === "create" ? "Create a new parent" : "Update parent"}
      </h1>

      {type === "create" && (
        <>
          <span className="text-xs text-gray-400 font-medium">Login Information</span>
          <div className="flex justify-between flex-wrap gap-4">
            <InputField
              label="Username"
              name="username"
              register={register}
              error={(errors as any).username}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              register={register}
              error={(errors as any).email}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              register={register}
              error={(errors as any).password}
            />
          </div>
        </>
      )}

      <span className="text-xs text-gray-400 font-medium">Personal Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="First Name" name="name" register={register} error={errors.name} />
        <InputField label="Last Name" name="surname" register={register} error={errors.surname} />
        <InputField label="Phone" name="phone" register={register} error={errors.phone} />
        <InputField label="Address" name="address" register={register} error={errors.address} />
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

export default ParentForm;