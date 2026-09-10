"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_BOOK, UPDATE_BOOK } from "@/lib/graphql/queries";

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  author: z.string().min(1, { message: "Author is required" }),
  isbn: z.string().min(1, { message: "ISBN is required" }),
  category: z.string().optional(),
  totalCopies: z.coerce.number().min(1, { message: "Must have at least 1 copy" }),
});

type Inputs = z.infer<typeof schema>;

const BookForm = ({
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
      title: data?.title ?? "",
      author: data?.author ?? "",
      isbn: data?.isbn ?? "",
      category: data?.category ?? "",
      totalCopies: data?.totalCopies ?? 1,
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
        await client.request(CREATE_BOOK, { input: formData });
      } else {
        // totalCopies is intentionally left out of updates here — the
        // backend derives availableCopies from the delta, and the update
        // form doesn't need to touch it day-to-day.
        const { totalCopies, ...rest } = formData;
        await client.request(UPDATE_BOOK, { id: data.id, input: { ...rest, totalCopies } });
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
        {type === "create" ? "Add a new book" : "Update book"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Title" name="title" register={register} error={errors.title} />
        <InputField label="Author" name="author" register={register} error={errors.author} />
        <InputField label="ISBN" name="isbn" register={register} error={errors.isbn} />
        <InputField
          label="Category"
          name="category"
          register={register}
          error={errors.category}
        />
        <InputField
          label="Total copies"
          name="totalCopies"
          type="number"
          register={register}
          error={errors.totalCopies}
        />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {submitting ? "Saving..." : type === "create" ? "Add book" : "Update"}
      </button>
    </form>
  );
};

export default BookForm;