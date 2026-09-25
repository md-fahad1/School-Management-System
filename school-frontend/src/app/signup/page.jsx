"use client";

import React, { useState } from "react";
import { Mail, Lock, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { roleHome } from "@/lib/roleHome";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/authSlice";
import { getErrorMessage } from "@/lib/errors";
import { useTranslation } from "@/lib/i18n/useTranslation";

const SignUp = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    surname: "",
    role: "PARENT",
    institutionSlug: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("auth.signUpFailed"));

      const { accessToken, id, username, role } = data;

      Cookies.set("token", accessToken, { expires: 1 });
      Cookies.set("userId", id, { expires: 30 });
      Cookies.set("username", username, { expires: 30 });
      Cookies.set("role", role.toLowerCase(), { expires: 30 });

      dispatch(setCredentials({ token: accessToken, id, username, role }));

      router.push(roleHome(role));
    } catch (err) {
      setError(
        getErrorMessage(err, t("auth.signUpError"))
      );
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
            {t("auth.welcomeTitle")}
          </h2>
          <p className="mt-2 text-primaryLight text-sm">
            {t("auth.platformDescription")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-cardBg rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <div className="md:hidden w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-center text-textPrimary mb-1">
            {t("auth.createAccount")}
          </h2>
          <p className="text-center text-sm text-textMuted mb-6">
            {t("auth.createAccountSubtitle")}
          </p>

          {/* Student accounts are created by an admin, not self-signup,
              since they require a class/grade/parent assignment. */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-textSecondary text-sm">{t("auth.firstName")}</label>
                <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                  <User className="text-textMuted mr-2" size={16} />
                  <input
                    type="text"
                    name="name"
                    placeholder={t("auth.firstNamePlaceholder")}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-textSecondary text-sm">{t("auth.lastName")}</label>
                <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                  <input
                    type="text"
                    name="surname"
                    placeholder={t("auth.lastNamePlaceholder")}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                    value={form.surname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-textSecondary text-sm">{t("auth.username")}</label>
              <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                <User className="text-textMuted mr-2" size={16} />
                <input
                  type="text"
                  name="username"
                  placeholder={t("auth.usernamePlaceholder")}
                  className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-textSecondary text-sm">{t("auth.email")}</label>
              <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                <Mail className="text-textMuted mr-2" size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder={t("auth.emailPlaceholder")}
                  className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-textSecondary text-sm">{t("auth.passwordLabel")}</label>
              <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                <Lock className="text-textMuted mr-2" size={16} />
                <input
                  type="password"
                  name="password"
                  placeholder={t("auth.passwordHint")}
                  className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-textSecondary text-sm">{t("auth.institutionCode")}</label>
              <input
                type="text"
                name="institutionSlug"
                placeholder={t("auth.institutionCodePlaceholder")}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg outline-none text-sm focus:border-accent focus:ring-2 focus:ring-accentLight transition-colors"
                value={form.institutionSlug}
                onChange={handleChange}
                required
              />
              <p className="mt-1 text-xs text-textMuted">
                {t("auth.institutionCodeHint")}
              </p>
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primaryDark transition-colors shadow-sm disabled:opacity-60"
              disabled={loading}
            >
              {loading ? t("auth.creatingAccount") : t("auth.signUpButton") /* fallback below */}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-textMuted">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/signin" className="text-accent hover:underline font-medium">
              {t("auth.signInLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;