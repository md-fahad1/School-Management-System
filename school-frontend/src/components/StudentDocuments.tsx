"use client";

import { useState, type FormEvent } from "react";
import Cookies from "js-cookie";
import { FileText, Ticket, Award } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { getErrorMessage } from "@/lib/errors";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";

const API_BASE = (process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql").replace(
  "/graphql",
  "",
);

const PRESETS = [
  {
    label: "Character Certificate",
    type: "Character Certificate",
    title: "Character Certificate",
    body: "This is to certify that {name} has been a student of this institution and has shown good moral character and conduct throughout the period of study.",
  },
  {
    label: "Transfer Certificate",
    type: "Transfer Certificate",
    title: "Transfer Certificate",
    body: "This is to certify that {name} was a student of this institution. All dues have been cleared and this student is hereby granted a transfer certificate.",
  },
  {
    label: "Certificate of Achievement",
    type: "Certificate of Achievement",
    title: "Certificate of Achievement",
    body: "This certificate is proudly presented to {name} in recognition of outstanding achievement and dedication.",
  },
];

// Downloads a PDF from the backend. Calling getClientGqlClient() first makes
// sure the access token is fresh (it refreshes an expired one).
async function downloadPdf(
  path: string,
  filename: string,
  options: { method?: string; json?: unknown } = {},
) {
  await getClientGqlClient();
  const token = Cookies.get("token");

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (options.json !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : undefined,
  });

  if (!res.ok) {
    let message = "Could not generate the document";
    try {
      const body = await res.json();
      if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
      }
    } catch {
      // response was not JSON; keep the default message
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

type Props = {
  studentId: string;
  studentName: string;
  examTitles: string[];
  canIssueCertificate: boolean;
};

const inputCls =
  "w-full px-3 py-2 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent";

const btnCls =
  "flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border text-textPrimary hover:bg-accentLight transition-colors disabled:opacity-60";

export default function StudentDocuments({
  studentId,
  studentName,
  examTitles,
  canIssueCertificate,
}: Props) {
  const toast = useToast();
  const [examTitle, setExamTitle] = useState(examTitles[0] ?? "");
  const [busy, setBusy] = useState<"" | "report" | "admit" | "certificate">("");

  const [open, setOpen] = useState(false);
  const [cert, setCert] = useState({
    type: PRESETS[0].type,
    title: PRESETS[0].title,
    body: PRESETS[0].body,
    issuedDate: "",
  });
  const [certError, setCertError] = useState("");

  const safeName = studentName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  const handleExamDoc = async (kind: "report-card" | "admit-card") => {
    if (!examTitle.trim()) {
      toast.error("Enter the exam title first.");
      return;
    }
    setBusy(kind === "report-card" ? "report" : "admit");
    try {
      await downloadPdf(
        `/reports/${kind}/${studentId}?examTitle=${encodeURIComponent(examTitle.trim())}`,
        `${kind}-${safeName}.pdf`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not generate the document"));
    } finally {
      setBusy("");
    }
  };

  const applyPreset = (index: number) => {
    const p = PRESETS[index];
    setCert((c) => ({ ...c, type: p.type, title: p.title, body: p.body }));
  };

  const handleCertificate = async (e: FormEvent) => {
    e.preventDefault();
    setCertError("");
    setBusy("certificate");
    try {
      const json: Record<string, string> = {
        type: cert.type.trim(),
        title: cert.title.trim(),
        body: cert.body.trim(),
      };
      if (cert.issuedDate) json.issuedDate = cert.issuedDate;
      await downloadPdf(`/reports/certificate/${studentId}`, `certificate-${safeName}.pdf`, {
        method: "POST",
        json,
      });
      toast.success("Certificate downloaded.");
      setOpen(false);
    } catch (err) {
      setCertError(getErrorMessage(err, "Could not generate the certificate"));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl">
      <h1 className="text-xl font-semibold">Documents</h1>

      <div className="mt-4">
        <label className="block mb-1 text-xs text-textMuted">Exam title</label>
        <input
          list="student-exam-titles"
          value={examTitle}
          onChange={(e) => setExamTitle(e.target.value)}
          placeholder="e.g. Midterm 2026"
          className={inputCls}
        />
        <datalist id="student-exam-titles">
          {examTitles.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        {examTitles.length === 0 && (
          <p className="text-xs text-textMuted mt-1">
            No exams found for this class yet. You can still type a title.
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleExamDoc("report-card")}
          disabled={busy !== ""}
          className={btnCls}
        >
          <FileText size={14} />
          {busy === "report" ? "Preparing..." : "Report card"}
        </button>
        <button
          type="button"
          onClick={() => handleExamDoc("admit-card")}
          disabled={busy !== ""}
          className={btnCls}
        >
          <Ticket size={14} />
          {busy === "admit" ? "Preparing..." : "Admit card"}
        </button>
        {canIssueCertificate && (
          <button type="button" onClick={() => setOpen(true)} className={btnCls}>
            <Award size={14} />
            Certificate
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Issue certificate">
        <form onSubmit={handleCertificate} className="flex flex-col gap-3">
          <div>
            <label className="block mb-1 text-sm text-textSecondary">Start from a template</label>
            <select
              defaultValue={0}
              onChange={(e) => applyPreset(Number(e.target.value))}
              className={inputCls}
            >
              {PRESETS.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm text-textSecondary">Type</label>
              <input
                value={cert.type}
                onChange={(e) => setCert({ ...cert, type: e.target.value })}
                className={inputCls}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-textSecondary">Heading</label>
              <input
                value={cert.title}
                onChange={(e) => setCert({ ...cert, title: e.target.value })}
                className={inputCls}
                required
                minLength={2}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm text-textSecondary">Text</label>
            <textarea
              value={cert.body}
              onChange={(e) => setCert({ ...cert, body: e.target.value })}
              rows={5}
              className={inputCls}
              required
              minLength={5}
            />
            <p className="text-xs text-textMuted mt-1">
              Write {"{name}"} where the student&apos;s name should appear.
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm text-textSecondary">Issue date (optional)</label>
            <input
              type="date"
              value={cert.issuedDate}
              onChange={(e) => setCert({ ...cert, issuedDate: e.target.value })}
              className={inputCls}
            />
          </div>

          {certError && <p className="text-sm text-red-500">{certError}</p>}

          <button
            type="submit"
            disabled={busy === "certificate"}
            className="bg-primary text-white py-2 rounded-lg text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
          >
            {busy === "certificate" ? "Generating..." : "Generate PDF"}
          </button>
        </form>
      </Modal>
    </div>
  );
}