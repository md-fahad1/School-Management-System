"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { IMPORT_STUDENTS_CSV } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "./ui/ToastProvider";

const ImportCsvButton = () => {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ created: number; failed: { row: number; error: string }[] } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setSummary(null);
    try {
      const text = await file.text();
      const client = await getClientGqlClient();
      const data = await client.request<{
        importStudentsCsv: { created: number; failed: { row: number; error: string }[] };
      }>(IMPORT_STUDENTS_CSV, { csv: text });
      setSummary(data.importStudentsCsv);
      if (data.importStudentsCsv.created > 0) {
        toast.success(`${data.importStudentsCsv.created} student(s) imported.`);
      }
      if (data.importStudentsCsv.failed.length > 0) {
        toast.error(`${data.importStudentsCsv.failed.length} row(s) could not be imported.`);
      }
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Import failed. Please check your file and try again."));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          disabled={loading}
          className="text-xs"
        />
        {loading && <span className="text-xs text-gray-400">Importing...</span>}
      </div>
      {summary && (
        <div className="text-xs">
          <span className="text-green-600 font-medium">{summary.created} created</span>
          {summary.failed.length > 0 && (
            <span className="text-red-500 ml-2">
              {summary.failed.length} failed (
              {summary.failed.slice(0, 3).map((f) => `row ${f.row}: ${f.error}`).join("; ")}
              {summary.failed.length > 3 ? "..." : ""})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportCsvButton;