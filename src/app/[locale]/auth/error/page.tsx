"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  const locale = useLocale();

  return (
    <main className="min-h-screen bg-bg text-fg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="font-heading font-bold text-2xl mb-2">
          {locale === "ru" ? "Ошибка авторизации" : "Authentication error"}
        </h1>
        <p className="text-muted mb-6">
          {locale === "ru"
            ? "Не удалось войти в аккаунт. Попробуйте ещё раз."
            : "Could not sign in. Please try again."}
        </p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-2 bg-pitch hover:bg-accent text-bg font-bold px-6 py-3 rounded-xl transition-colors"
        >
          {locale === "ru" ? "Попробовать снова" : "Try again"}
        </Link>
      </div>
    </main>
  );
}
