"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { gql } from "@/lib/graphql/gql";
import { GET_CLASSES, GET_GRADES, IMPORT_STUDENTS_CSV } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import Modal from "./ui/Modal";
import { useToast } from "./ui/ToastProvider";

/* ------------------------------------------------------------------ */
/*  Settings — backend er sathe na mille shudhu ei 2 ta jinis change   */
/* ------------------------------------------------------------------ */

// Backend er importStudentsCsv ja ja header expect kore (StudentForm er input er moto).
const OUTPUT_HEADERS = [
  "username",
  "email",
  "password",
  "name",
  "surname",
  "phone",
  "address",
  "classId",
  "gradeId",
  "parentId",
];

// Backend er error e "row" koto theke shuru hoy?
// 1 = prothom student row er number 1 (header gona hoy na)
// 2 = header ke row 1 dhore, prothom student row = 2
const SERVER_ROW_STARTS_AT = 1;

/* ------------------------------------------------------------------ */

const GET_PARENTS_FOR_IMPORT = gql`
  query ParentsForImport {
    parents(take: 500) {
      id
      name
      surname
      email
      phone
    }
  }
`;

type ClassOpt = { id: string; name: string };
type GradeOpt = { id: string; level: number };
type ParentOpt = { id: string; name: string; surname?: string; email?: string; phone?: string };
type Lookup = { classes: ClassOpt[]; grades: GradeOpt[]; parents: ParentOpt[] };

type Problem = { row: number; message: string };
type Analysis = {
  total: number;
  good: string[][]; // shajano row (OUTPUT_HEADERS er order e)
  goodRows: number[]; // proti good row er original row number (spreadsheet er moto, header = 1)
  problems: Problem[];
  fileProblem?: string;
};
type ImportResult = { created: number; failed: Problem[] };

/* ------------------------------ CSV helpers ------------------------------ */

function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const firstLine = src.split(/\r?\n/)[0] ?? "";
  // Kichu Excel ";" diye alada kore — auto detect kori.
  const delim =
    (firstLine.match(/;/g) ?? []).length > (firstLine.match(/,/g) ?? []).length ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const escapeCell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const toCsv = (rows: string[][]) => rows.map((r) => r.map(escapeCell).join(",")).join("\n");

const normHeader = (h: string) => h.toLowerCase().replace(/[\s_\-]/g, "");
const normText = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const digitsOnly = (s: string) => s.replace(/\D/g, "");

// CSV header -> amader vitorer field. Ekhane jei nam gulo likha, oigulo cholbe.
const ALIASES: Record<string, string> = {
  username: "username",
  email: "email",
  password: "password",
  name: "name",
  firstname: "name",
  surname: "surname",
  lastname: "surname",
  phone: "phone",
  address: "address",
  classid: "classId",
  class: "className",
  classname: "className",
  gradeid: "gradeId",
  grade: "gradeLevel",
  gradelevel: "gradeLevel",
  parentid: "parentId",
  parent: "parentRef",
  parentemail: "parentRef",
  parentphone: "parentRef",
  parentname: "parentRef",
};

const shortList = (items: string[], max = 6) =>
  items.length <= max ? items.join(", ") : `${items.slice(0, max).join(", ")}, …`;

/* ------------------------------ Validation ------------------------------ */

function analyze(text: string, lookup: Lookup): Analysis {
  const empty: Analysis = { total: 0, good: [], goodRows: [], problems: [] };
  const table = parseCsv(text);
  const isBlank = (r: string[]) => r.every((c) => c.trim() === "");
  const dataRowCount = table.slice(1).filter((r) => !isBlank(r)).length;

  if (table.length === 0 || dataRowCount === 0) {
    return { ...empty, fileProblem: "This file has no student rows. Please use the template." };
  }

  const fields = table[0].map((h) => ALIASES[normHeader(h)]);
  const col = (f: string) => fields.indexOf(f);

  // Dorkari column ache kina
  const missing: string[] = [];
  if (col("username") < 0) missing.push("username");
  if (col("email") < 0) missing.push("email");
  if (col("password") < 0) missing.push("password");
  if (col("name") < 0) missing.push("name");
  if (col("surname") < 0) missing.push("surname");
  if (col("classId") < 0 && col("className") < 0) missing.push("class");
  if (col("gradeId") < 0 && col("gradeLevel") < 0) missing.push("grade");
  if (col("parentId") < 0 && col("parentRef") < 0) missing.push("parentEmail");
  if (missing.length > 0) {
    return {
      ...empty,
      fileProblem: `These columns are missing: ${missing.join(", ")}. Please download the template and copy your data into it.`,
    };
  }

  // Lookup table gulo
  const classByName = new Map(lookup.classes.map((c) => [normText(c.name), c.id]));
  const gradeByLevel = new Map(lookup.grades.map((g) => [String(g.level), g.id]));
  const parentByEmail = new Map<string, string>();
  const parentByPhone = new Map<string, string>();
  const parentsByName = new Map<string, string[]>();
  for (const p of lookup.parents) {
    if (p.email) parentByEmail.set(normText(p.email), p.id);
    if (p.phone && digitsOnly(p.phone).length >= 6) parentByPhone.set(digitsOnly(p.phone), p.id);
    const full = normText(`${p.name ?? ""} ${p.surname ?? ""}`);
    parentsByName.set(full, [...(parentsByName.get(full) ?? []), p.id]);
  }

  const classNames = lookup.classes.map((c) => c.name);
  const gradeLevels = lookup.grades.map((g) => String(g.level));

  const result: Analysis = { ...empty, total: dataRowCount };

  for (let r = 1; r < table.length; r++) {
    const cells = table[r];
    if (isBlank(cells)) continue; // faka line — skip
    const get = (f: string) => (col(f) >= 0 ? (cells[col(f)] ?? "").trim() : "");
    const errors: string[] = [];

    for (const f of ["username", "email", "password", "name", "surname"]) {
      if (!get(f)) errors.push(`${f} is empty`);
    }
    if (get("email") && !get("email").includes("@")) errors.push(`email "${get("email")}" looks wrong`);

    // Class
    let classId = get("classId");
    if (!classId) {
      const v = get("className");
      if (!v) errors.push("class is empty");
      else {
        classId = classByName.get(normText(v)) ?? "";
        if (!classId) errors.push(`class "${v}" not found (available: ${shortList(classNames) || "none yet"})`);
      }
    }

    // Grade
    let gradeId = get("gradeId");
    if (!gradeId) {
      const v = get("gradeLevel");
      if (!v) errors.push("grade is empty");
      else {
        const level = v.match(/\d+/)?.[0];
        gradeId = level ? gradeByLevel.get(String(Number(level))) ?? "" : "";
        if (!gradeId) errors.push(`grade "${v}" not found (available: ${shortList(gradeLevels) || "none yet"})`);
      }
    }

    // Parent — email, phone ba full name, jekono ekta
    let parentId = get("parentId");
    if (!parentId) {
      const v = get("parentRef");
      if (!v) errors.push("parent is empty");
      else {
        parentId =
          parentByEmail.get(normText(v)) ??
          (digitsOnly(v).length >= 6 ? parentByPhone.get(digitsOnly(v)) : undefined) ??
          "";
        if (!parentId) {
          const byName = parentsByName.get(normText(v)) ?? [];
          if (byName.length === 1) parentId = byName[0];
          else if (byName.length > 1)
            errors.push(`${byName.length} parents are named "${v}" — use the parent's email instead`);
          else errors.push(`parent "${v}" not found — add the parent first`);
        }
      }
    }

    // Spreadsheet e header = row 1, tai prothom student = row 2
    const sheetRow = r + 1;
    if (errors.length > 0) {
      result.problems.push({ row: sheetRow, message: errors.join("; ") });
      continue;
    }

    const out: Record<string, string> = {
      username: get("username"),
      email: get("email"),
      password: get("password"),
      name: get("name"),
      surname: get("surname"),
      phone: get("phone"),
      address: get("address"),
      classId,
      gradeId,
      parentId,
    };
    result.good.push(OUTPUT_HEADERS.map((h) => out[h] ?? ""));
    result.goodRows.push(sheetRow);
  }

  return result;
}

/* -------------------------------- Component -------------------------------- */

const ImportCsvButton = () => {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [loadError, setLoadError] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const loadLookup = async () => {
    setLoadError("");
    try {
      const client = await getClientGqlClient();
      const [classes, grades, parents] = await Promise.all([
        client.request<{ classes: ClassOpt[] }>(GET_CLASSES, { take: 200 }),
        client.request<{ grades: GradeOpt[] }>(GET_GRADES),
        client.request<{ parents: ParentOpt[] }>(GET_PARENTS_FOR_IMPORT),
      ]);
      setLookup({ classes: classes.classes, grades: grades.grades, parents: parents.parents });
    } catch (err) {
      setLoadError(getErrorMessage(err, "Couldn't load your classes and parents. Please try again."));
    }
  };

  const openModal = () => {
    setOpen(true);
    setAnalysis(null);
    setResult(null);
    setFileName("");
    if (!lookup) void loadLookup();
  };

  const close = useCallback(() => setOpen(false), []);

  const downloadTemplate = () => {
    const example = [
      "rahim.uddin",
      "rahim@example.com",
      "Pass1234",
      "Rahim",
      "Uddin",
      "01700000000",
      "Dhaka",
      lookup?.classes[0]?.name ?? "Class 5-A",
      String(lookup?.grades[0]?.level ?? 5),
      lookup?.parents.find((p) => p.email)?.email ?? "parent@example.com",
    ];
    const header = ["username", "email", "password", "name", "surname", "phone", "address", "class", "grade", "parentEmail"];
    // \uFEFF = Excel e Bangla naam thikmoto dekhar jonno
    const blob = new Blob(["\uFEFF" + toCsv([header, example])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students-template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // same file abar choose korle jeno kaj kore
    if (!file || !lookup) return;
    setResult(null);
    setFileName(file.name);
    setAnalysis(analyze(await file.text(), lookup));
  };

  const handleImport = async () => {
    if (!analysis || analysis.good.length === 0) return;
    setImporting(true);
    try {
      const csv = toCsv([OUTPUT_HEADERS, ...analysis.good]);
      const client = await getClientGqlClient();
      const data = await client.request<{
        importStudentsCsv: { created: number; failed: { row: number; error: string }[] };
      }>(IMPORT_STUDENTS_CSV, { csv });

      const { created, failed } = data.importStudentsCsv;
      const mapped: Problem[] = failed.map((f) => ({
        // Server er row number ke abar user er file er row number e phiriye dei.
        row: analysis.goodRows[f.row - SERVER_ROW_STARTS_AT] ?? f.row,
        message: getErrorMessage(f.error, "Could not be imported"),
      }));
      setResult({ created, failed: mapped });
      setAnalysis(null);
      if (created > 0) toast.success(`${created} student(s) imported.`);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Import failed. Please check your file and try again."));
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={openModal} className="btn-secondary">
        <Upload size={16} />
        Import CSV
      </button>

      <Modal open={open} onClose={close} title="Import students from a CSV file">
        <div className="flex flex-col gap-5 text-sm">
          {loadError && (
            <p role="alert" className="rounded-lg bg-dangerLight px-3 py-2 text-danger">
              {loadError}
            </p>
          )}

          {/* STEP 1 */}
          <section className="rounded-xl border border-border p-4">
            <h3 className="font-semibold text-textPrimary">Step 1 — Get the template</h3>
            <p className="mt-1 text-textSecondary">
              Write the <b>class name</b> (like “Class 5-A”), the <b>grade number</b> (like 5) and the{" "}
              <b>parent&apos;s email</b>. You don&apos;t need any IDs. Save the file as{" "}
              <b>CSV UTF-8</b> if you use Bangla names.
            </p>
            <button type="button" onClick={downloadTemplate} className="btn-secondary mt-3">
              <Download size={16} />
              Download template
            </button>
          </section>

          {/* STEP 2 */}
          <section className="rounded-xl border border-border p-4">
            <h3 className="font-semibold text-textPrimary">Step 2 — Choose your file</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="hidden"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!lookup || importing}
                className="btn-primary"
              >
                <Upload size={16} />
                {lookup ? "Choose CSV file" : "Loading…"}
              </button>
              {fileName && <span className="text-textSecondary">{fileName}</span>}
            </div>
          </section>

          {/* STEP 3 — check result */}
          {analysis?.fileProblem && (
            <p role="alert" className="rounded-lg bg-dangerLight px-3 py-2 text-danger">
              {analysis.fileProblem}
            </p>
          )}

          {analysis && !analysis.fileProblem && (
            <section className="rounded-xl border border-border p-4">
              <h3 className="font-semibold text-textPrimary">Step 3 — Check and import</h3>

              <p className="mt-2 flex items-center gap-2 text-success">
                <CheckCircle2 size={16} />
                {analysis.good.length} of {analysis.total} rows are ready to import.
              </p>

              {analysis.problems.length > 0 && (
                <div className="mt-3 rounded-lg bg-dangerLight p-3 text-danger">
                  <p className="flex items-center gap-2 font-medium">
                    <AlertCircle size={16} />
                    {analysis.problems.length} row(s) need fixing:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {analysis.problems.slice(0, 10).map((p) => (
                      <li key={p.row}>
                        <b>Row {p.row}:</b> {p.message}
                      </li>
                    ))}
                  </ul>
                  {analysis.problems.length > 10 && (
                    <p className="mt-2">…and {analysis.problems.length - 10} more.</p>
                  )}
                  <p className="mt-2 text-xs">
                    Fix these in your file and choose it again, or import the good rows now and fix
                    the rest later.
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || analysis.good.length === 0}
                  className="btn-primary"
                >
                  {importing
                    ? "Importing…"
                    : `Import ${analysis.good.length} student${analysis.good.length === 1 ? "" : "s"}`}
                </button>
              </div>
            </section>
          )}

          {/* STEP 4 — final result */}
          {result && (
            <section className="rounded-xl border border-border p-4">
              <p className="flex items-center gap-2 font-medium text-success">
                <CheckCircle2 size={16} />
                {result.created} student(s) imported.
              </p>
              {result.failed.length > 0 && (
                <div className="mt-3 rounded-lg bg-dangerLight p-3 text-danger">
                  <p className="font-medium">{result.failed.length} row(s) could not be imported:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {result.failed.slice(0, 10).map((f, i) => (
                      <li key={`${f.row}-${i}`}>
                        <b>Row {f.row}:</b> {f.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button type="button" onClick={close} className="btn-secondary mt-4">
                Done
              </button>
            </section>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ImportCsvButton;