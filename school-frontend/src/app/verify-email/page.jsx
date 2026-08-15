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
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto animate-spin text-pink-600 mb-4" size={40} />
            <h2 className="text-2xl font-bold text-gray-800">Verifying your email...</h2>
            <p className="text-gray-500 mt-2">Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto text-green-500 mb-4" size={40} />
            <h2 className="text-2xl font-bold text-gray-800">Email verified!</h2>
            <p className="text-gray-500 mt-2 mb-6">
              Your email address has been confirmed. You're all set.
            </p>
            <Link
              href="/signin"
              className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Continue to Sign In
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto text-red-500 mb-4" size={40} />
            <h2 className="text-2xl font-bold text-gray-800">Verification failed</h2>
            <p className="text-gray-500 mt-2 mb-6">{error}</p>
            <Link href="/signin" className="text-pink-600 hover:underline text-sm">
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