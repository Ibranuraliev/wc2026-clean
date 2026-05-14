"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { User as UserIcon, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { strings } from "@/i18n/page-strings";

interface Me {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export function NavbarUser() {
  const locale = useLocale();
  const t = strings(locale);
  const [me, setMe] = useState<Me | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { if (alive) setLoaded(true); return; }
        const { data: row } = await sb.from("profiles").select("first_name,last_name").eq("id", user.id).single();
        if (alive) {
          setMe({
            email: user.email ?? "",
            first_name: row?.first_name ?? null,
            last_name: row?.last_name ?? null,
          });
          setLoaded(true);
        }
      } catch {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (!loaded) {
    return <div className="w-8 h-8 rounded border border-line/15 animate-pulse" />;
  }

  if (!me) {
    return (
      <Link
        href={`/${locale}/login`}
        className="flex items-center gap-1.5 px-3 h-8 rounded text-xs text-fg bg-pitch hover:bg-accent transition-colors font-bold"
      >
        <LogIn className="w-3.5 h-3.5" />
        {t.auth_login}
      </Link>
    );
  }

  const initials = `${(me.first_name ?? "?")[0] ?? "?"}${(me.last_name ?? "")[0] ?? ""}`.toUpperCase();

  return (
    <Link
      href={`/${locale}/profile`}
      title={`${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() || me.email}
      className="flex items-center justify-center w-8 h-8 rounded border border-line/15 bg-pitch/10 text-pitch text-[11px] font-heading font-bold hover:bg-pitch/20 hover:border-pitch/50 transition-colors"
    >
      {initials.trim() || <UserIcon className="w-3.5 h-3.5" />}
    </Link>
  );
}
