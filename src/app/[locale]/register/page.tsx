"use client";

import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { strings } from "@/i18n/page-strings";
import {
  validateEmail, validatePassword, validateName, passwordsMatch,
  type ValidationKey,
} from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, Field, SubmitButton } from "@/components/auth-form";

function errMsg(k: ValidationKey | null, t: ReturnType<typeof strings>): string | undefined {
  if (!k) return undefined;
  return (t as unknown as Record<string, string>)[`err_${k}`] ?? k;
}

export default function RegisterPage() {
  const locale = useLocale();
  const t = strings(locale);
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);

  // OTP step
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = {
      firstName: errMsg(validateName(firstName), t),
      lastName:  errMsg(validateName(lastName),  t),
      email:     errMsg(validateEmail(email),    t),
      password:  errMsg(validatePassword(password), t),
      confirm:   errMsg(passwordsMatch(password, confirm), t),
    };
    if (Object.values(next).some(Boolean)) {
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const sb = createClient();
    const { error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
      },
    });
    setBusy(false);
    if (error) {
      setErrors({ root: t.auth_signup_failed + " " + (error.message ?? "") });
      return;
    }
    setStep("otp");
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setOtp(text.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  async function verifyOtp() {
    const code = otp.join("");
    if (code.length < 6) return;
    setOtpBusy(true);
    setOtpError("");
    const sb = createClient();
    const { error } = await sb.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    setOtpBusy(false);
    if (error) {
      setOtpError(t.auth_otp_invalid);
      return;
    }
    // Upsert profile
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      try {
        const upsertData = {
          id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: fullName,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (sb.from("profiles") as any).upsert(upsertData, { onConflict: "id" });
      } catch { /* not fatal */ }
    }
    router.push(`/${locale}`);
    router.refresh();
  }

  async function resendCode() {
    setResent(false);
    const sb = createClient();
    await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
      },
    });
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  // OTP screen
  if (step === "otp") {
    return (
      <AuthShell title={t.auth_otp_title} subtitle={`${t.auth_otp_subtitle} ${email}`}>
        <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className="w-11 h-13 text-center text-2xl font-heading font-bold bg-bg border border-line/20 rounded focus:border-pitch focus:ring-1 focus:ring-pitch/30 text-fg outline-none transition-colors"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {otpError && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2 mb-3 text-center">
            {otpError}
          </p>
        )}

        <SubmitButton disabled={otpBusy || otp.join("").length < 6} onClick={verifyOtp}>
          {otpBusy ? "..." : t.auth_otp_submit}
        </SubmitButton>

        <button
          type="button"
          onClick={resendCode}
          className="w-full text-center text-xs text-muted hover:text-pitch mt-3 transition-colors"
        >
          {resent ? t.auth_otp_resent : t.auth_otp_resend}
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t.auth_register}
      subtitle={t.hero_subtitle}
      footer={
        <>
          {t.auth_have_account}{" "}
          <Link href={`/${locale}/login`} className="text-pitch hover:text-accent font-semibold">
            {t.auth_login}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.auth_first_name} value={firstName} onChange={setFirstName} error={errors.firstName} autoComplete="given-name" required />
          <Field label={t.auth_last_name}  value={lastName}  onChange={setLastName}  error={errors.lastName}  autoComplete="family-name" required />
        </div>
        <Field label={t.auth_email}            type="email"    value={email}    onChange={setEmail}    error={errors.email}    autoComplete="email"        required />
        <Field label={t.auth_password}         type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" required />
        <Field label={t.auth_password_confirm} type="password" value={confirm}  onChange={setConfirm}  error={errors.confirm}  autoComplete="new-password" required />
        {errors.root && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{errors.root}</p>
        )}
        <SubmitButton disabled={busy}>{busy ? "..." : t.auth_register_cta}</SubmitButton>
      </form>
    </AuthShell>
  );
}
