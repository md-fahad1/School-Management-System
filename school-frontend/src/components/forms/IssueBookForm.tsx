"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { getClientGqlClient } from "@/lib/graphql/client";
import { ISSUE_BOOK, GET_BOOK_OPTIONS, GET_BORROWER_OPTIONS } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  bookId: z.string().min(1, { message: "Select a book" }),
  borrowerId: z.string().min(1, { message: "Select a borrower" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
});

type Inputs = z.infer<typeof schema>;

const IssueBookForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const [bookOptions, setBookOptions] = useState<
    { id: string; title: string; availableCopies: number }[]
  >([]);
  const [borrowerOptions, setBorrowerOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const client = await getClientGqlClient();
        const [books, borrowers] = await Promise.all([
          client.request<{ books: { id: string; title: string; availableCopies: number }[] }>(
            GET_BOOK_OPTIONS
          ),
          client.request<{
            students: { userId: string; name: string; surname: string }[];
            teachers: { userId: string; name: string; surname: string }[];
          }>(GET_BORROWER_OPTIONS),
        ]);
        setBookOptions(books.books.filter((b) => b.availableCopies > 0));
        setBorrowerOptions([
          ...borrowers.students.map((s) => ({
            id: s.userId,
            label: `${s.name} ${s.surname} (Student)`,
          })),
          ...borrowers.teachers.map((t) => ({
            id: t.userId,
            label: `${t.name} ${t.surname} (Teacher)`,
          })),
        ]);
      } catch (err) {
        console.error("Failed to load issue-book options:", err);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const client = await getClientGqlClient();
      await client.request(ISSUE_BOOK, {
        input: {
          bookId: formData.bookId,
          borrowerId: formData.borrowerId,
          dueDate: new Date(formData.dueDate).toISOString(),
        },
      });
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
      <h1 className="text-xl font-semibold">Issue a book</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Book</label>
          <select
            {...register("bookId")}
            className="field"
            defaultValue=""
          >
            <option value="" disabled>
              Select a book
            </option>
            {bookOptions.map((b) => (
              <option value={b.id} key={b.id}>
                {b.title} ({b.availableCopies} available)
              </option>
            ))}
          </select>
          {errors.bookId?.message && (
            <p className="text-xs text-danger">{errors.bookId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-textMuted">Borrower</label>
          <select
            {...register("borrowerId")}
            className="field"
            defaultValue=""
          >
            <option value="" disabled>
              Select a borrower
            </option>
            {borrowerOptions.map((b) => (
              <option value={b.id} key={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          {errors.borrowerId?.message && (
            <p className="text-xs text-danger">{errors.borrowerId.message.toString()}</p>
          )}
        </div>

        <InputField
          label="Due date"
          name="dueDate"
          type="date"
          register={register}
          error={errors.dueDate}
        />
      </div>

      {submitError && <span className="text-red-500 text-sm">{submitError}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary sm:self-end sm:px-8"
      >
        {submitting ? "Issuing..." : "Issue book"}
      </button>
    </form>
  );
};

export default IssueBookForm;