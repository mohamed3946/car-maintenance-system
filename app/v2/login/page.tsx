"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { useSystem } from "@/providers/SystemProvider";

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useSystem();

  const isArabic = lang === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkCurrentSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/v2/dashboard");
        return;
      }

      setCheckingSession(false);
    }

    void checkCurrentSession();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage(
        isArabic
          ? "أدخل البريد الإلكتروني وكلمة المرور."
          : "Enter your email and password."
      );

      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          isArabic
            ? getArabicAuthError(error.message)
            : error.message
        );

        return;
      }

      router.replace("/v2/dashboard");
      router.refresh();
    } catch {
      setErrorMessage(
        isArabic
          ? "حدث خطأ غير متوقع أثناء تسجيل الدخول."
          : "An unexpected error occurred while signing in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fc]">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-slate-700 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />

          <span className="text-sm font-black">
            {isArabic
              ? "جاري التحقق من الجلسة..."
              : "Checking session..."}
          </span>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="flex min-h-screen items-center justify-center bg-[#f4f7fc] px-4 py-10"
    >
      <div className="w-full max-w-[460px]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="bg-gradient-to-br from-[#0c3665] via-[#082a52] to-[#041a33] px-7 py-9 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg">
              <ShieldCheck className="h-8 w-8 text-sky-300" />
            </div>

            <h1 className="mt-5 text-3xl font-black">
              DeliveryOS
            </h1>

            <p className="mt-2 text-sm font-bold text-white/75">
              {isArabic
                ? "منصة إدارة شركات التوصيل"
                : "Delivery Companies Management Platform"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-7">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {isArabic ? "تسجيل الدخول" : "Sign In"}
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-500">
                {isArabic
                  ? "أدخل بيانات حسابك للوصول إلى النظام."
                  : "Enter your account details to access the system."}
              </p>
            </div>

            <div className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  {isArabic
                    ? "البريد الإلكتروني"
                    : "Email Address"}
                </span>

                <div className="relative">
                  <Mail className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder="admin@example.com"
                    dir="ltr"
                    className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pe-4 ps-12 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  {isArabic
                    ? "كلمة المرور"
                    : "Password"}
                </span>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    dir="ltr"
                    className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pe-12 ps-12 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? isArabic
                          ? "إخفاء كلمة المرور"
                          : "Hide password"
                        : isArabic
                        ? "إظهار كلمة المرور"
                        : "Show password"
                    }
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </label>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />

                  {isArabic
                    ? "جاري تسجيل الدخول..."
                    : "Signing In..."}
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />

                  {isArabic
                    ? "دخول إلى النظام"
                    : "Sign In"}
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function getArabicAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "لم يتم تأكيد البريد الإلكتروني.";
  }

  if (normalizedMessage.includes("too many requests")) {
    return "تم إجراء محاولات كثيرة. حاول مرة أخرى بعد قليل.";
  }

  return "تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.";
}