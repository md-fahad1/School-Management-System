"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_VEHICLE, UPDATE_VEHICLE, GET_ROUTE_OPTIONS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  vehicleNumber: z.string().min(1, { message: "Vehicle number is required" }),
  type: z.string().min(1, { message: "Type is required (e.g. Bus, Van)" }),
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1" }),
  driverName: z.string().min(1, { message: "Driver name is required" }),
  route: z.string().optional(),
  routeId: z.string().optional(),
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
      routeId: data?.routeId ?? "",
      status: data?.status ?? "ACTIVE",
    },
  });

  const [routeOptions, setRouteOptions] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const result = await client.request<{ routes: { id: string; name: string }[] }>(
          GET_ROUTE_OPTIONS
        );
        setRouteOptions(result.routes);
      } catch (err) {
        console.error("Failed to load route options:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      const input = { ...formData, routeId: formData.routeId || undefined };
      if (type === "create") {
        await client.request(CREATE_VEHICLE, { input });
      } else {
        await client.request(UPDATE_VEHICLE, { id: data.id, input });
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
        {type === "create" ? "Add a new vehicle" : "Update vehicle"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Vehicle number" name="vehicleNumber" register={register} error={errors.vehicleNumber} />
        <InputField label="Type (Bus / Van)" name="type" register={register} error={errors.type} />
        <InputField label="Capacity" name="capacity" type="number" register={register} error={errors.capacity} />
        <InputField label="Driver name" name="driverName" register={register} error={errors.driverName} />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Route</label>
          <select {...register("routeId")} className="field">
            <option value="">No route assigned</option>
            {routeOptions.map((r) => (
              <option value={r.id} key={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Status</label>
          <select
            {...register("status")}
            className="field"
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
        className="btn-primary sm:self-end sm:px-8"
      >
        {submitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default VehicleForm;