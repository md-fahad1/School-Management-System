"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_CLASSES, GET_GRADES, GET_PARENT_OPTIONS } from "@/lib/graphql/queries";

const CREATE_STUDENT = gql`
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      id
    }
  }
`;

const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    updateStudent(id: $id, input: $input) {
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
  classId: z.string().min(1, { message: "Class is required" }),
  gradeId: z.string().min(1, { message: "Grade is required" }),
  parentId: z.string().min(1, { message: "Parent is required" }),
});

const updateSchema = z.object({
  name: z.string().min(1, { message: "First name is required" }),
  surname: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  classId: z.string().min(1, { message: "Class is required" }),
  gradeId: z.string().min(1, { message: "Grade is required" }),
  parentId: z.string().min(1, { message: "Parent is required" }),
});

const StudentForm = ({
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
        classId: data?.classId ?? "",
        gradeId: data?.gradeId ?? "",
        parentId: data?.parentId ?? "",
      }
    : undefined,
  });

  const [classOptions, setClassOptions] = useState<{ id: string; name: string }[]>([]);
  const [gradeOptions, setGradeOptions] = useState<{ id: string; level: number }[]>([]);
  const [parentOptions, setParentOptions] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const [classes, grades, parents] = await Promise.all([
          client.request<{ classes: { id: string; name: string }[] }>(GET_CLASSES, { take: 200 }),
          client.request<{ grades: { id: string; level: number }[] }>(GET_GRADES),
          client.request<{ parents: { id: string; name: string }[] }>(GET_PARENT_OPTIONS),
        ]);
        setClassOptions(classes.classes);
        setGradeOptions(grades.grades);
        setParentOptions(parents.parents);
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
      if (type === "create") {
        await client.request(CREATE_STUDENT, { input: formData });
      } else {
        await client.request(UPDATE_STUDENT, { id: data.id, input: formData });
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
        {type === "create" ? "Create a new student" : "Update student"}
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

      <span className="text-xs text-gray-400 font-medium">Enrollment</span>
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-textMuted">Class</label>
          <select
            {...register("classId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select a class</option>
            {classOptions.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-textMuted">Grade</label>
          <select
            {...register("gradeId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select a grade</option>
            {gradeOptions.map((g) => (
              <option value={g.id} key={g.id}>
                Grade {g.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">{errors.gradeId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-textMuted">Parent</label>
          <select
            {...register("parentId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select a parent</option>
            {parentOptions.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.parentId?.message && (
            <p className="text-xs text-red-400">{errors.parentId.message.toString()}</p>
          )}
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

export default StudentForm;