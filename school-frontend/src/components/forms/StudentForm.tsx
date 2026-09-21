"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import PhotoUploadField from "../PhotoUploadField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_CLASSES, GET_GRADES, GET_PARENT_OPTIONS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

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
  img: z.string().optional(),
  bloodType: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  birthday: z.string().optional(),
  admissionNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  classId: z.string().min(1, { message: "Class is required" }),
  gradeId: z.string().min(1, { message: "Grade is required" }),
  parentId: z.string().min(1, { message: "Parent is required" }),
});

const updateSchema = z.object({
  name: z.string().min(1, { message: "First name is required" }),
  surname: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  img: z.string().optional(),
  bloodType: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  birthday: z.string().optional(),
  admissionNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
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
    watch,
    setValue,
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
        img: data?.img ?? "",
        bloodType: data?.bloodType ?? "",
        sex: data?.sex ?? undefined,
        birthday: data?.birthday ? data.birthday.slice(0, 10) : "",
        admissionNumber: data?.admissionNumber ?? "",
        registrationNumber: data?.registrationNumber ?? "",
        emergencyContactName: data?.emergencyContactName ?? "",
        emergencyContactPhone: data?.emergencyContactPhone ?? "",
        classId: data?.classId ?? "",
        gradeId: data?.gradeId ?? "",
        parentId: data?.parentId ?? "",
      }
    : undefined,
  });

  // Make sure react-hook-form tracks the uploaded photo URL like a
  // normal field, since PhotoUploadField isn't a plain <input>.
  useEffect(() => {
    register("img");
  }, [register]);

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
        getErrorMessage(err, "Something went wrong. Please try again.")
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
          <span className="text-xs font-semibold uppercase tracking-wide text-textSecondary border-b border-border pb-2">Login Information</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <span className="text-xs font-semibold uppercase tracking-wide text-textSecondary border-b border-border pb-2">Personal Information</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="First Name" name="name" register={register} error={errors.name} />
        <InputField label="Last Name" name="surname" register={register} error={errors.surname} />
        <InputField label="Phone" name="phone" register={register} error={errors.phone} />
        <InputField label="Address" name="address" register={register} error={errors.address} />
        <InputField label="Blood Type" name="bloodType" register={register} error={(errors as any).bloodType} />
        <InputField label="Birthday" name="birthday" type="date" register={register} error={(errors as any).birthday} />
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Gender</label>
          <select {...register("sex")} className="field">
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <PhotoUploadField
          label="Photo"
          value={watch("img")}
          onChange={(url) => setValue("img", url, { shouldDirty: true })}
        />
      </div>

      <span className="text-xs font-semibold uppercase tracking-wide text-textSecondary border-b border-border pb-2">Admission &amp; Emergency Contact</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Admission Number" name="admissionNumber" register={register} error={(errors as any).admissionNumber} />
        <InputField label="Registration Number" name="registrationNumber" register={register} error={(errors as any).registrationNumber} />
        <InputField label="Emergency Contact Name" name="emergencyContactName" register={register} error={(errors as any).emergencyContactName} />
        <InputField label="Emergency Contact Phone" name="emergencyContactPhone" register={register} error={(errors as any).emergencyContactPhone} />
      </div>

      <span className="text-xs font-semibold uppercase tracking-wide text-textSecondary border-b border-border pb-2">Enrollment</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Class</label>
          <select
            {...register("classId")}
            className="field"
          >
            <option value="">Select a class</option>
            {classOptions.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-danger">{errors.classId.message.toString()}</p>
          )}
        </div>

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
          <label className="text-xs text-textMuted">Parent</label>
          <select
            {...register("parentId")}
            className="field"
          >
            <option value="">Select a parent</option>
            {parentOptions.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.parentId?.message && (
            <p className="text-xs text-danger">{errors.parentId.message.toString()}</p>
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

export default StudentForm;