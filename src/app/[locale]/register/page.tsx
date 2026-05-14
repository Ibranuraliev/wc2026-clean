"use client";

import { useState } from "react";
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
  const [done, setDone] = useState(false);

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
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/${locale}/auth/callback`
            : undefined,
      },
    });
    if (error) {
      setBusy(false);
      setErrors({ root: t.auth_signup_failed + " " + (error.message ?? "") });
      return;
    }
    // Fallback: upsert profile client-side in case the DB trigger missed it.
    const userId = data?.user?.id;
    if (userId) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      try {
        const upsertData = {
          id: userId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: fullName,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (sb.from("profiles") as any).upsert(upsertData, { onConflict: "id" });
      } catch {
        /* not fatal */
      }
    }
    setBusy(false);
    setDone(true);
    setTimeout(() => router.push(`/${locale}`), 1500);
  }

  if (done) {
    return (
      <AuthShell title={t.auth_register}>
        <p className="text-center text-pitch font-semibold">{t.auth_check_email}</p>
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
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{errors.root}</p>
        )}
        <SubmitButton disabled={busy}>{busy ? "..." : t.auth_register_cta}</SubmitButton>
      </form>
    </AuthShell>
  );
}
