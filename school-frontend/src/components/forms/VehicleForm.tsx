"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_VEHICLE, UPDATE_VEHICLE } from "@/lib/graphql/queries";

const schema = z.object({
  vehicleNumber: z.string().min(1, { message: "Vehicle number is required" }),
  type: z.string().min(1, { message: "Type is required (e.g. Bus, Van)" }),
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1" }),
  driverName: z.string().min(1, { message: "Driver name is required" }),
  route: z.string().optional(),
  status: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const VehicleForm = ({
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
      vehicleNumber: data?.vehicleNumber ?? "",
      type: data?.type ?? "",
      capacity: data?.capacity ?? undefined,
      driverName: data?.driverName ?? "",
      route: data?.route ?? "",
      status: data?.status ?? "ACTIVE",
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
        await client.request(CREATE_VEHICLE, { input: formData });
      } else {
        await client.request(UPDATE_VEHICLE, { id: data.id, input: formData });
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
        {type === "create" ? "Add a new vehicle" : "Update vehicle"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Vehicle number" name="vehicleNumber" register={register} error={errors.vehicleNumber} />
        <InputField label="Type (Bus / Van)" name="type" register={register} error={errors.type} />
        <InputField label="Capacity" name="capacity" type="number" register={register} error={errors.capacity} />
        <InputField label="Driver name" name="driverName" register={register} error={errors.driverName} />
        <InputField label="Route" name="route" register={register} error={errors.route} />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-textMuted">Status</label>
          <select
            {...register("status")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
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

export default VehicleForm;