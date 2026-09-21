"use client";
import { getErrorMessage } from "@/lib/errors";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import PhotoUploadField from "../PhotoUploadField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_SUBJECTS } from "@/lib/graphql/queries";
import MultiSelectChips from "../MultiSelectChips";
const CREATE_TEACHER = gql`
  mutation CreateTeacher($input: CreateTeacherInput!) {
    createTeacher(input: $input) {
      id
    }
  }
`;

const UPDATE_TEACHER = gql`
  mutation UpdateTeacher($id: ID!, $input: UpdateTeacherInput!) {
    updateTeacher(id: $id, input: $input) {
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
  subjectIds: z.array(z.string()).optional(),
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
  subjectIds: z.array(z.string()).optional(),
});

const TeacherForm = ({
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
  } = useForm<Inputs>({    resolver: zodResolver(schema),
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
        subjectIds: data?.subjectIds ?? [],
      }
    : undefined,
  });
  const selectedSubjects = (watch("subjectIds") ?? []) as string[];

  // Make sure react-hook-form tracks the chip selection like a normal field.
  useEffect(() => {
    register("subjectIds");
    register("img");
  }, [register]);
  const [subjectOptions, setSubjectOptions] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const result = await client.request<{ subjects: { id: string; name: string }[] }>(
          GET_SUBJECTS,
          { take: 200 }
        );
        setSubjectOptions(result.subjects);
      } catch (err) {
        console.error("Failed to load subject options:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      if (type === "create") {
        await client.request(CREATE_TEACHER, { input: formData });
      } else {
        await client.request(UPDATE_TEACHER, { id: data.id, input: formData });
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
        {type === "create" ? "Create a new teacher" : "Update teacher"}
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
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
        />
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
         <MultiSelectChips
          label="Subjects"
          options={subjectOptions}
          value={selectedSubjects}
          onChange={(next) => setValue("subjectIds", next, { shouldDirty: true })}
          emptyText="No subjects available yet"
        />
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

export default TeacherForm;