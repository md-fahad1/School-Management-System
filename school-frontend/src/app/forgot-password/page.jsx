"use client";

import React, { useState } from "react";
import { Mail, GraduationCap } from "lucide-react";
import Link from "next/link";
import { getClientGqlClient } from "@/lib/graphql/client";
import { REQUEST_PASSWORD_RESET } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import { useTranslation } from "@/lib/i18n/useTranslation";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // The backend always returns true for this mutation regardless of
  // whether the email matches an account (anti-enumeration — see
  // PasswordResetService.requestReset on the backend). The UI mirrors
  // that: it never confirms or denies an account exists, it just
  // shows the same "check your inbox" message either way.
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const client = await getClientGqlClient();
      await client.request(REQUEST_PASSWORD_RESET, { input: { email } });
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, t("auth.signUpError")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-bg">
      <div className="hidden md:flex flex-col items-center justify-center bg-primary relative overflow-hidden p-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-white/5" />

        <div className="relative max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="text-white" size={32} />
          </div>
          <img src="/img/img3.svg" alt="Illustration" className="w-full h-auto max-w-xs mx-auto" />
          <h2 className="text-2xl font-bold mt-6 text-white">
            {t("auth.forgotTitle")}
          </h2>
          <p className="mt-2 text-primaryLight text-sm">
            {t("auth.forgotSubtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-cardBg rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <div className="md:hidden w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-center text-textPrimary mb-6">
            {t("auth.resetPasswordTitle")}
          </h2>

          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-textSecondary">
                {t("auth.resetSentPrefix")} <span className="font-medium text-textPrimary">{email}</span>,{" "}
                {t("auth.resetSentSuffix")}
              </p>
              <Link href="/signin" className="text-accent hover:underline text-sm font-medium">
                {t("auth.backToSignIn")}
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-1.5 text-textSecondary text-sm">{t("auth.emailAddressLabel")}</label>
                  <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                    <Mail className="text-textMuted mr-2" size={18} />
                    <input
                      type="email"
                      placeholder={t("auth.emailAddressPlaceholder")}
                      className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-danger">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primaryDark transition-colors shadow-sm disabled:opacity-60"
                >
                  {loading ? t("auth.sending") : t("auth.sendResetLink")}
                </button>
              </form>

              <p className="mt-6 text-center text-textMuted text-sm">
                {t("auth.rememberedPassword")}{" "}
                <Link href="/signin" className="text-accent hover:underline font-medium">
                  {t("auth.signInLink")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;