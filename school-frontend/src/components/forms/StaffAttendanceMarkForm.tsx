"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { GET_USERS, MARK_STAFF_ATTENDANCE } from "@/lib/graphql/queries";

// These are the non-teaching roles this form covers. Add a role here
// the moment it exists as its own Role enum value on the backend.
const STAFF_ROLES = ["ACCOUNTANT", "LIBRARIAN", "PRINCIPAL"];

const schema = z.object({
  userId: z.string().min(1, { message: "Select a staff member" }),
  date: z.string().min(1, { message: "Date is required" }),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EARLY_LEAVE", "ON_LEAVE"]),
  remarks: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const StaffAttendanceMarkForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const [staffOptions, setStaffOptions] = useState<
    { id: string; username: string; roleName: string }[]
  >([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const data = await client.request<{
          users: { id: string; username: string; roleName: string }[];
        }>(GET_USERS, {});
        setStaffOptions(data.users.filter((u) => STAFF_ROLES.includes(u.roleName)));
      } catch (err) {
        console.error("Failed to load staff options:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(MARK_STAFF_ATTENDANCE, {
        input: {
          userId: formData.userId,
          date: formData.date,
          status: formData.status,
          remarks: formData.remarks || undefined,
        },
      });
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
      <h1 className="text-xl font-semibold">Mark staff attendance</h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[45%]">
          <label className="text-xs text-textMuted">Staff member</label>
          <select
            {...register("userId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue=""
          >
            <option value="" disabled>
              Select a staff member
            </option>
            {staffOptions.map((u) => (
              <option value={u.id} key={u.id}>
                {u.username} ({u.roleName})
              </option>
            ))}
          </select>
          {errors.userId?.message && (
            <p className="text-xs text-red-400">{errors.userId.message.toString()}</p>
          )}
        </div>

        <InputField label="Date" name="date" type="date" register={register} error={errors.date} />

        <div className="flex flex-col gap-2 w-full md:w-[45%]">
          <label className="text-xs text-textMuted">Status</label>
          <select
            {...register("status")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue="PRESENT"
          >
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="EARLY_LEAVE">Early leave</option>
            <option value="ON_LEAVE">On leave</option>
          </select>
        </div>

        <InputField label="Remarks (optional)" name="remarks" register={register} error={errors.remarks} />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save attendance"}
      </button>
    </form>
  );
};

export default StaffAttendanceMarkForm;