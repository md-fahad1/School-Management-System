"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { VERIFY_EMAIL } from "@/lib/graphql/queries";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const didRun = useRef(false);

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [error, setError] = useState("");

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (!token) {
      setStatus("error");
      setError("This verification link is missing its token.");
      return;
    }

    (async () => {
      try {
        const client = await getClientGqlClient();
        await client.request(VERIFY_EMAIL, { input: { token } });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err?.response?.errors?.[0]?.message ??
            "This verification link is invalid or has expired."
        );
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md text-center bg-cardBg rounded-2xl shadow-sm border border-border p-8">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto animate-spin text-accent mb-4" size={40} />
            <h2 className="text-2xl font-bold text-textPrimary">Verifying your email...</h2>
            <p className="text-textMuted mt-2">Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto text-success mb-4" size={40} />
            <h2 className="text-2xl font-bold text-textPrimary">Email verified!</h2>
            <p className="text-textMuted mt-2 mb-6">
              Your email address has been confirmed. You&apos;re all set.
            </p>
            <Link
              href="/signin"
              className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primaryDark transition-colors shadow-sm"
            >
              Continue to Sign In
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto text-danger mb-4" size={40} />
            <h2 className="text-2xl font-bold text-textPrimary">Verification failed</h2>
            <p className="text-textMuted mt-2 mb-6">{error}</p>
            <Link href="/signin" className="text-accent hover:underline text-sm font-medium">
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

function VerifyEmail() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}