"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, User as UserIcon, KeyRound } from "lucide-react";
import { strings } from "@/i18n/page-strings";
import {
  validateName, validatePassword, passwordsMatch,
  type ValidationKey,
} from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { Field, SubmitButton } from "@/components/auth-form";

function errMsg(k: ValidationKey | null, t: ReturnType<typeof strings>): string | undefined {
  if (!k) return undefined;
  return (t as any)[`err_${k}`] ?? k;
}

interface Profile {
  email: string;
  first_name: string;
  last_name: string;
}

export default function ProfilePage() {
  const locale = useLocale();
  const t = strings(locale);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Name form
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [nameErrors, setNameErrors] = useState<Record<string, string | undefined>>({});
  const [nameBusy, setNameBusy] = useState(false);
  const [nameOk, setNameOk] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdErrors, setPwdErrors] = useState<Record<string, string | undefined>>({});
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdOk, setPwdOk] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      const { data: row } = await sb.from("profiles").select("first_name, last_name").eq("id", user.id).single();
      const p: Profile = {
        email: user.email ?? "",
        first_name: row?.first_name ?? "",
        last_name:  row?.last_name  ?? "",
      };
      setProfile(p);
      setFirstName(p.first_name);
      setLastName(p.last_name);
      setLoading(false);
    })();
  }, [locale, router]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameOk(false);
    const next = {
      firstName: errMsg(validateName(firstName), t),
      lastName:  errMsg(validateName(lastName),  t),
    };
    if (Object.values(next).some(Boolean)) {
      setNameErrors(next);
      return;
    }
    setNameErrors({});
    setNameBusy(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setNameBusy(false); return; }
    await sb.from("profiles").update({
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      display_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
    }).eq("id", user.id);
    setNameBusy(false);
    setNameOk(true);
    setTimeout(() => setNameOk(false), 2500);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdOk(false);
    const next = {
      newPassword: errMsg(validatePassword(newPassword), t),
      confirmPassword: errMsg(passwordsMatch(newPassword, confirmPassword), t),
    };
    if (Object.values(next).some(Boolean)) {
      setPwdErrors(next);
      return;
    }
    setPwdErrors({});
    setPwdBusy(true);
    const sb = createClient();
    const { error } = await sb.auth.updateUser({ password: newPassword });
    setPwdBusy(false);
    if (error) {
      setPwdErrors({ root: error.message ?? "Error" });
      return;
    }
    setPwdOk(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwdOk(false), 2500);
  }

  async function logout() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  if (loading) {
    return <main className="min-h-screen bg-bg text-fg flex items-center justify-center">…</main>;
  }
  if (!profile) return null;

  return (
    <main className="min-h-screen bg-bg text-fg px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-pitch mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Road to 2026
        </Link>

        <h1 className="font-heading font-bold text-3xl text-fg mb-1">{t.auth_profile}</h1>
        <p className="text-muted text-sm mb-6">{profile.email}</p>

        {/* Name card */}
        <form onSubmit={saveName} className="bg-surface border border-line/15 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-4 h-4 text-pitch" />
            <h2 className="font-heading font-bold text-fg text-sm uppercase tracking-widest">{t.auth_profile}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Field label={t.auth_first_name} value={firstName} onChange={setFirstName} error={nameErrors.firstName} autoComplete="given-name" required />
            <Field label={t.auth_last_name}  value={lastName}  onChange={setLastName}  error={nameErrors.lastName}  autoComplete="family-name" required />
          </div>
          {nameOk && <p className="text-xs text-pitch mb-3">{t.auth_profile_updated}</p>}
          <SubmitButton disabled={nameBusy}>{nameBusy ? "..." : t.auth_save_changes}</SubmitButton>
        </form>

        {/* Password card */}
        <form onSubmit={changePassword} className="bg-surface border border-line/15 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-pitch" />
            <h2 className="font-heading font-bold text-fg text-sm uppercase tracking-widest">{t.auth_change_password}</h2>
          </div>
          <div className="space-y-3 mb-4">
            <Field label={t.auth_password_new}     type="password" value={newPassword}     onChange={setNewPassword}     error={pwdErrors.newPassword}     autoComplete="new-password" required />
            <Field label={t.auth_password_confirm} type="password" value={confirmPassword} onChange={setConfirmPassword} error={pwdErrors.confirmPassword} autoComplete="new-password" required />
          </div>
          {pwdErrors.root && <p className="text-xs text-red-400 mb-3">{pwdErrors.root}</p>}
          {pwdOk && <p className="text-xs text-pitch mb-3">{t.auth_password_updated}</p>}
          <SubmitButton disabled={pwdBusy}>{pwdBusy ? "..." : t.auth_change_password}</SubmitButton>
        </form>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 border border-line/15 text-muted hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/40 py-3 rounded-xl text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" /> {t.auth_logout}
        </button>
      </div>
    </main>
  );
}
