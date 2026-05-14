"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { strings } from "@/i18n/page-strings";
import { validateEmail, validatePassword, type ValidationKey } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, Field, SubmitButton } from "@/components/auth-form";

function errMsg(k: ValidationKey | null, t: ReturnType<typeof strings>): string | undefined {
  if (!k) return undefined;
  const key = `err_${k}` as const;
  return (t as unknown as Record<string, string>)[key] ?? k;
}

export default function LoginPage() {
  const locale = useLocale();
  const t = strings(locale);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; root?: string }>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = errMsg(validateEmail(email), t);
    const pErr = errMsg(validatePassword(password), t);
    if (eErr || pErr) {
      setErrors({ email: eErr, password: pErr });
      return;
    }
    setErrors({});
    setBusy(true);
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setErrors({ root: t.auth_login_failed });
      return;
    }
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <AuthShell
      title={t.auth_login}
      subtitle={t.hero_subtitle}
      footer={
        <>
          {t.auth_dont_have_account}{" "}
          <Link href={`/${locale}/register`} className="text-pitch hover:text-accent font-semibold">
            {t.auth_register}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label={t.auth_email}
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Field
          label={t.auth_password}
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
          required
        />
        {errors.root && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {errors.root}
          </p>
        )}
        <SubmitButton disabled={busy}>{busy ? "..." : t.auth_login_cta}</SubmitButton>
      </form>
    </AuthShell>
  );
}
