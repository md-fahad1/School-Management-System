"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useToast } from "./ui/ToastProvider";

const API_BASE = (process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql").replace(
  "/graphql",
  ""
);

const ExportCsvButton = ({ endpoint, filename }: { endpoint: string; filename: string }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await fetch(`${API_BASE}/export/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${filename} downloaded.`);
    } catch (err) {
      console.error("CSV export failed:", err);
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="bg-lamaSky px-4 py-2 rounded-md text-sm disabled:opacity-60"
    >
      {loading ? "Exporting..." : "Export CSV"}
    </button>
  );
};

export default ExportCsvButton;