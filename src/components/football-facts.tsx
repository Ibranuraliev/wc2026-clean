"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Trophy, Goal, Star, Calendar, Users, Flag } from "lucide-react";
import { useLocale } from "next-intl";
import { CountryFlag } from "@/components/country-flag";
import { strings } from "@/i18n/page-strings";

interface ChampionFact {
  code: string;
  titles: number;
  years: number[];
}

const CHAMPIONS: ChampionFact[] = [
  { code: "BRA", titles: 5, years: [1958, 1962, 1970, 1994, 2002] },
  { code: "GER", titles: 4, years: [1954, 1974, 1990, 2014] },
  { code: "ITA", titles: 4, years: [1934, 1938, 1982, 2006] },
  { code: "ARG", titles: 3, years: [1978, 1986, 2022] },
  { code: "FRA", titles: 2, years: [1998, 2018] },
  { code: "URU", titles: 2, years: [1930, 1950] },
  { code: "ENG", titles: 1, years: [1966] },
  { code: "ESP", titles: 1, years: [2010] },
];

interface ScorerFact {
  code: string;
  playerKey: "klose" | "ronaldo" | "muller" | "fontaine" | "pele";
  goals: number;
}

const TOP_SCORERS: ScorerFact[] = [
  { code: "GER", playerKey: "klose",    goals: 16 },
  { code: "BRA", playerKey: "ronaldo",  goals: 15 },
  { code: "GER", playerKey: "muller",   goals: 14 },
  { code: "FRA", playerKey: "fontaine", goals: 13 },
  { code: "BRA", playerKey: "pele",     goals: 12 },
];

export function FootballFacts() {
  const pr = useReducedMotion();
  const locale = useLocale();
  const t = strings(locale);

  const miscFacts: { icon: React.ReactNode; title: string; body: string; highlight?: string }[] = [
    { icon: <Users    className="w-4 h-4" />, title: t.fact_48_title,        body: t.fact_48_body,        highlight: "48 / 104" },
    { icon: <Flag     className="w-4 h-4" />, title: t.fact_hosts_title,     body: t.fact_hosts_body,     highlight: locale === "en" ? "11 Jun — 19 Jul" : "11.06 — 19.07" },
    { icon: <Trophy   className="w-4 h-4" />, title: t.fact_defending_title, body: t.fact_defending_body, highlight: "ARG ★" },
    { icon: <Goal     className="w-4 h-4" />, title: t.fact_attst_title,     body: t.fact_attst_body,     highlight: "9" },
    { icon: <Calendar className="w-4 h-4" />, title: t.fact_1930_title,     body: t.fact_1930_body,     highlight: "1930" },
    { icon: <Goal     className="w-4 h-4" />, title: t.fact_75_title,       body: t.fact_75_body,       highlight: "7:5" },
    { icon: <Flag     className="w-4 h-4" />, title: t.fact_101_title,      body: t.fact_101_body,      highlight: "10:1" },
    { icon: <Star     className="w-4 h-4" />, title: t.fact_pele_title,     body: t.fact_pele_body,     highlight: locale === "en" ? "17 yrs" : "17 Ð»ÐµÑ" },
  ];

  function countryLabel(code: string): string {
    const k = `country_${code}` as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (t as any)[k] ?? code;
  }
  function scorer(s: ScorerFact) {
    const player = t[`scorer_${s.playerKey}` as const];
    const detail = t[`scorer_${s.playerKey}_d` as const];
    return { player, detail };
  }

  return (
    <div className="space-y-6">
      {/* Champions table */}
      <div className="bg-surface rounded-2xl border border-line/15 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-heading font-bold text-lg text-fg">{t.facts_champions_title}</h3>
          <span className="ml-auto text-xs text-muted tabular-nums">{t.facts_champions_meta}</span>
        </div>
        <div className="space-y-1">
          {CHAMPIONS.map((c, i) => (
            <motion.div
              key={c.code}
              initial={pr ? {} : { opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="grid grid-cols-[24px_28px_1fr_auto] items-center gap-3 px-3 py-2 rounded-xl hover:bg-line/5 transition-colors"
            >
              <span className="text-sm tabular-nums font-bold text-muted">{i + 1}</span>
              <CountryFlag code={c.code} size={18} />
              <div className="min-w-0">
                <p className="font-medium text-fg truncate">{countryLabel(c.code)}</p>
                <p className="text-xs text-muted truncate tabular-nums">{c.years.join(" · ")}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {Array.from({ length: c.titles }).map((_, k) => (
                  <Star key={k} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top scorers */}
      <div className="bg-surface rounded-2xl border border-line/15 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Goal className="w-5 h-5 text-pitch" />
          <h3 className="font-heading font-bold text-lg text-fg">{t.facts_scorers_title}</h3>
        </div>
        <div className="space-y-2">
          {TOP_SCORERS.map((s, i) => {
            const { player, detail } = scorer(s);
            return (
              <div
                key={s.playerKey}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg border border-line/10"
              >
                <span className="font-heading font-bold text-2xl tabular-nums text-pitch shrink-0 w-8 text-right">
                  {s.goals}
                </span>
                <CountryFlag code={s.code} size={18} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg truncate">{player}</p>
                  <p className="text-xs text-muted truncate">{detail}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted shrink-0">
                  #{i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Misc fact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {miscFacts.map((f, i) => (
          <motion.div
            key={f.title}
            initial={pr ? {} : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="bg-surface border border-line/15 rounded-2xl p-4 hover:border-pitch/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2 text-pitch">
              {f.icon}
              <span className="text-xs font-bold uppercase tracking-widest">{f.title}</span>
              {f.highlight && (
                <span className="ml-auto text-xs text-muted tabular-nums font-heading">
                  {f.highlight}
                </span>
              )}
            </div>
            <p className="text-sm text-fg leading-snug">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
