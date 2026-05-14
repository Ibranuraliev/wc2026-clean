"use client";

import { useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import {
  Trophy,
  Save, ArrowDown, ArrowRight,
  Globe,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { usePredictionStore, Team } from "@/store/prediction-store";
import { createClient } from "@/lib/supabase/client";
import { Countdown } from "@/components/countdown";
import { CountryFlag } from "@/components/country-flag";
import { ThemeToggle } from "@/components/theme-toggle";
import { MusicPlayer } from "@/components/music-player";
import { NavbarUser } from "@/components/navbar-user";
import { ThirdPlacePicker } from "@/components/third-place-picker";
import { WC2026_TEAMS } from "@/data/wc2026-teams";
import { strings } from "@/i18n/page-strings";

const GroupCard = dynamic(() => import("@/components/group-card").then((m) => m.GroupCard), {
  ssr: false, loading: () => <div className="h-[220px] rounded bg-surface animate-pulse" />,
});
const BracketTree = dynamic(() => import("@/components/bracket-tree").then((m) => m.BracketTree), {
  ssr: false, loading: () => <div className="h-96 rounded bg-surface animate-pulse mx-4" />,
});
const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

function Navbar() {
  const locale = useLocale();
  const t = strings(locale);
  const pathname = usePathname();
  const router = useRouter();
  const other = locale === "ru" ? "en" : "ru";
  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur border-b border-line/15">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <a href="#hero" className="font-heading font-bold text-fg text-lg shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-sm bg-pitch text-bg shadow-[0_0_18px_-2px_rgba(0,177,64,0.6)]">
            <Trophy className="w-4 h-4" />
          </span>
          <span className="hidden sm:inline">{t.hero_title_pre} {t.hero_title_to} <span className="text-pitch">2026</span></span>
        </a>
        <nav className="flex items-center gap-0.5 overflow-x-auto flex-1">
          {[["#predict",t.nav_groups],["#bracket",t.nav_bracket]].map(([h,l]) => (
            <a key={h} href={h} className="px-3 py-1.5 rounded text-sm text-muted hover:text-fg hover:bg-line/5 whitespace-nowrap transition-colors">{l}</a>
          ))}
          <a href={`/${locale}/play/monopoly`} className="px-3 py-1.5 rounded text-sm text-pitch hover:text-accent hover:bg-pitch/10 whitespace-nowrap transition-colors font-bold">⚽ Монополия</a>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block"><Countdown /></div>
          <MusicPlayer />
          <ThemeToggle compact />
          <NavbarUser />
          <button onClick={() => router.push(pathname.replace(`/${locale}`,`/${other}`))}
            className="flex items-center gap-1 px-2 h-8 rounded text-xs text-muted hover:text-fg hover:bg-line/5 border border-line/15 hover:border-pitch/40 transition-colors">
            <Globe className="w-3.5 h-3.5" />{other.toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function Page() {
  const locale = useLocale();
  const t = strings(locale);
  const pr = useReducedMotion();

  const { teams, setTeams, groups, isDirty, resetDirty } = usePredictionStore();

  useEffect(() => {
    setTeams(WC2026_TEAMS);
    // Initialise default group standings so the bracket can resolve slots
    // even before the user has manually reordered anything.
    const currentGroups = usePredictionStore.getState().groups;
    const needsInit = GROUPS.some((l) => !currentGroups[l] || currentGroups[l].length === 0);
    if (needsInit) {
      GROUPS.forEach((l) => {
        if (!currentGroups[l] || currentGroups[l].length === 0) {
          const ids = WC2026_TEAMS.filter((t) => t.group_letter === l).map((t) => t.id);
          if (ids.length > 0) usePredictionStore.getState().setGroupStandings(l, ids);
        }
      });
    }
  }, [setTeams]);

  const teamsByGroup = GROUPS.reduce<Record<string, Team[]>>((acc, l) => {
    acc[l] = teams.filter((t) => t.group_letter === l); return acc;
  }, {});

  const saveGroups = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("predictions").upsert({ user_id: user.id, groups: groups as unknown as import("@/types/supabase").Json, bracket: usePredictionStore.getState().bracket as unknown as import("@/types/supabase").Json } as any, { onConflict: "user_id" });
    resetDirty();
  }, [groups, resetDirty]);


  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />

      {/* HERO */}
      <section id="hero" className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pitch/15 via-bg to-bg -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,177,64,0.25),transparent)] -z-10" />
        <div className="absolute inset-0 bg-pitch-stripes -z-10" />

        {/* Tri-color host band */}
        <div className="absolute top-0 left-0 right-0 h-[3px] tri-band -z-10" />

        <motion.div className="flex items-center gap-4 mb-6"
          initial={pr ? {} : { opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded border border-line/15 bg-surface/60 text-xs font-medium text-muted">
            <CountryFlag code="USA" size={14} /> USA
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded border border-line/15 bg-surface/60 text-xs font-medium text-muted">
            <CountryFlag code="CAN" size={14} /> Canada
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded border border-line/15 bg-surface/60 text-xs font-medium text-muted">
            <CountryFlag code="MEX" size={14} /> Mexico
          </span>
        </motion.div>

        <motion.h1
          className="font-heading font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-fg mb-5 max-w-4xl text-balance leading-[0.95]"
          initial={pr ? {} : { opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}>
          <span className="text-pitch">{t.hero_title_pre}</span>{" "}{t.hero_title_to}{" "}
          <span className="bg-gradient-to-r from-pitch to-accent bg-clip-text text-transparent">2026</span>
        </motion.h1>

        <motion.p className="text-muted text-lg sm:text-xl max-w-lg mb-10 text-balance"
          initial={pr ? {} : { opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}>
          {t.hero_subtitle}
        </motion.p>

        <motion.div className="flex flex-col sm:flex-row gap-3"
          initial={pr ? {} : { opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.3 }}>
          <a href="#predict" className="inline-flex items-center gap-2 bg-pitch hover:bg-accent text-bg font-heading font-bold px-8 py-4 rounded text-lg shadow-[0_10px_40px_-10px_rgba(0,177,64,0.6)] transition-all hover:-translate-y-0.5">
            {t.hero_cta_primary} <ArrowRight className="w-5 h-5" />
          </a>
          <a href="#bracket" className="inline-flex items-center gap-2 bg-surface border border-line/15 text-fg font-medium px-8 py-4 rounded text-lg hover:border-pitch/50 hover:bg-pitch/5 transition-all">
            🏆 {t.hero_cta_secondary}
          </a>
        </motion.div>

      </section>

      {/* GROUPS */}
      <section id="predict" className="pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading font-bold text-3xl text-fg mb-1">{t.groups_title}</h2>
              <p className="text-muted text-sm">{t.groups_subtitle}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={saveGroups} disabled={!isDirty}
                className="flex items-center gap-2 px-4 py-2 rounded border border-line/15 text-sm text-muted hover:bg-line/5 hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <Save className="w-4 h-4"/> {t.save}
              </button>
              <a href="#bracket"
                className="flex items-center gap-2 px-5 py-2 rounded-sm bg-pitch text-bg font-heading font-semibold text-sm hover:bg-accent transition-colors shadow-[0_0_24px_-6px_rgba(0,177,64,0.7)]">
                {t.to_bracket} <ArrowDown className="w-4 h-4"/>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {GROUPS.map((l) => <GroupCard key={l} letter={l} teams={teamsByGroup[l] ?? []} />)}
          </div>

          {/* 3rd-place qualifiers picker */}
          <div className="mt-6">
            <ThirdPlacePicker />
          </div>
        </div>
      </section>

      {/* BRACKET */}
      <section id="bracket" className="pb-12 bg-surface/40 border-y border-line/10">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
          <h2 className="font-heading font-bold text-3xl text-fg mb-1">{t.bracket_title}</h2>
          <p className="text-muted text-sm mb-1">
            {t.bracket_subtitle}
          </p>
          <p className="text-muted/70 text-xs mb-6">
            {t.bracket_hint}
          </p>
        </div>
        <BracketTree />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line/15 py-10 px-4 bg-surface/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span className="font-heading font-bold text-fg flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-pitch text-bg">
              <Trophy className="w-3.5 h-3.5" />
            </span>
            {t.footer_brand}
          </span>
          <span>{t.footer_disclaimer}</span>
          <span className="flex items-center gap-2 text-xs">
            <CountryFlag code="USA" size={12} /> USA
            <span className="text-muted/30">·</span>
            <CountryFlag code="CAN" size={12} /> Canada
            <span className="text-muted/30">·</span>
            <CountryFlag code="MEX" size={12} /> Mexico
          </span>
        </div>
      </footer>
    </div>
  );
}
