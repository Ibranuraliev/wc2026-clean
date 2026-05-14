"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { usePredictionStore, Team, BracketMatch } from "@/store/prediction-store";
import { CountryFlag } from "@/components/country-flag";
import { useLocale } from "next-intl";
import { teamName, strings } from "@/i18n/page-strings";

/* ─── layout constants ──────────────────────────────── */
const ZONE_H = 56;           // height of one "slot" in R32
const TOTAL_H = 8 * ZONE_H;  // total bracket height per side
const CONN_W = 22;            // connector SVG width

/* ─── helpers ────────────────────────────────────────── */
function useTeamMap(): Map<number, Team> {
  return new Map(usePredictionStore((s) => s.teams).map((t) => [t.id, t]));
}

/* ─── match card ─────────────────────────────────────── */
function MatchCard({
  match,
  teamMap,
  onPick,
}: {
  match: BracketMatch;
  teamMap: Map<number, Team>;
  onPick: (matchId: string, teamId: number) => void;
}) {
  const locale = useLocale();
  const tA = match.teamA ? (teamMap.get(match.teamA) ?? null) : null;
  const tB = match.teamB ? (teamMap.get(match.teamB) ?? null) : null;

  function Slot({ team, id }: { team: Team | null; id: number | null }) {
    const isWinner = match.winner !== null && match.winner === id;
    const isLoser = match.winner !== null && match.winner !== id;
    return (
      <button
        onClick={() => id && onPick(match.id, id)}
        disabled={!id}
        className={`flex items-center gap-1.5 w-full px-2 py-1 text-left transition-all text-xs
          ${isWinner ? "bg-pitch/20 text-pitch font-semibold" : ""}
          ${isLoser ? "opacity-35 line-through" : ""}
          ${!isWinner && !isLoser && id ? "hover:bg-pitch/10 cursor-pointer text-fg" : ""}
          ${!id ? "text-muted/40 cursor-default" : ""}
        `}
      >
        <CountryFlag code={team?.code ?? null} size={14} />
        <span className="truncate leading-tight">{teamName(team, locale) || "—"}</span>
        {isWinner && <Trophy className="w-3 h-3 ml-auto shrink-0 text-pitch" />}
      </button>
    );
  }

  return (
    <div
      className="bg-surface border border-line/15 rounded overflow-hidden shadow-md shadow-black/20 hover:border-pitch/30 transition-colors w-full"
      style={{ minWidth: 110 }}
    >
      <Slot team={tA} id={match.teamA} />
      <div className="h-px bg-line/10" />
      <Slot team={tB} id={match.teamB} />
    </div>
  );
}

/* ─── round column ───────────────────────────────────── */
function RoundColumn({
  matches,
  round,
  teamMap,
  onPick,
  label,
  labelAlign = "center",
}: {
  matches: BracketMatch[];
  round: string;
  teamMap: Map<number, Team>;
  onPick: (round: string, matchId: string, winnerId: number) => void;
  label: string;
  labelAlign?: "left" | "right" | "center";
}) {
  return (
    <div className="flex flex-col shrink-0" style={{ width: 140 }}>
      <span
        className={`text-[10px] font-bold uppercase tracking-widest text-muted mb-1
          ${labelAlign === "right" ? "text-right pr-1" : ""}
          ${labelAlign === "left" ? "text-left pl-1" : ""}
          ${labelAlign === "center" ? "text-center" : ""}
        `}
      >
        {label}
      </span>
      <div className="flex flex-col" style={{ height: TOTAL_H }}>
        {matches.map((m) => (
          <div key={m.id} className="flex-1 flex items-center w-full">
            <MatchCard
              match={m}
              teamMap={teamMap}
              onPick={(id, w) => onPick(round, id, w)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── connector SVG ──────────────────────────────────── */
function Connector({
  sourceCount,
  side,
}: {
  sourceCount: number;
  side: "left" | "right";
}) {
  const pairs = Math.floor(sourceCount / 2);

  return (
    <svg
      width={CONN_W}
      height={TOTAL_H}
      className="shrink-0 self-end"
    >
      {Array.from({ length: pairs }).map((_, i) => {
        // Center-Y of each match in the source column:
        // match k center = TOTAL_H * (2k + 1) / (2 * sourceCount)
        const topY =
          (TOTAL_H * (4 * i + 1)) / (2 * sourceCount);
        const botY =
          (TOTAL_H * (4 * i + 3)) / (2 * sourceCount);
        const midY = (topY + botY) / 2;

        const mx = CONN_W / 2;
        const x1 = side === "left" ? 0 : CONN_W;
        const x2 = side === "left" ? CONN_W : 0;

        return (
          <g key={i}>
            {/* horizontal from source top */}
            <line x1={x1} y1={topY} x2={mx} y2={topY}
              stroke="rgba(0,177,64,0.35)" strokeWidth="1.5" />
            {/* horizontal from source bottom */}
            <line x1={x1} y1={botY} x2={mx} y2={botY}
              stroke="rgba(0,177,64,0.35)" strokeWidth="1.5" />
            {/* vertical bar */}
            <line x1={mx} y1={topY} x2={mx} y2={botY}
              stroke="rgba(0,177,64,0.35)" strokeWidth="1.5" />
            {/* horizontal to target */}
            <line x1={mx} y1={midY} x2={x2} y2={midY}
              stroke="rgba(0,177,64,0.55)" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

/* ─── main bracket ───────────────────────────────────── */
export function BracketTree() {
  const locale = useLocale();
  const t = strings(locale);
  const { bracket, setBracketWinner, setChampion } = usePredictionStore();
  const teamMap = useTeamMap();

  function pick(round: string, matchId: string, winnerId: number) {
    setBracketWinner(round, matchId, winnerId);
    if (round === "final") setChampion(winnerId);
  }

  const champion = bracket.champion ? teamMap.get(bracket.champion) : null;

  // Left half
  const r32L = bracket.round32.slice(0, 8);
  const r16L = bracket.round16.slice(0, 4);
  const qfL = bracket.quarters.slice(0, 2);
  const sfL = bracket.semis.slice(0, 1);

  // Right half
  const r32R = bracket.round32.slice(8, 16);
  const r16R = bracket.round16.slice(4, 8);
  const qfR = bracket.quarters.slice(2, 4);
  const sfR = bracket.semis.slice(1, 2);

  if (bracket.round32.length === 0) {
    return (
      <div className="text-center py-16 text-muted/60">
        <p className="text-sm">{t.bracket_empty}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2 bracket-scroll">
      <div className="flex items-end justify-center gap-0 min-w-max px-4 py-4">

        {/* ── LEFT: R32 → SF ─────────────────── */}
        <RoundColumn matches={r32L} round="round32" teamMap={teamMap}
          onPick={pick} label={t.stage_r32} labelAlign="right" />
        <Connector sourceCount={8} side="left" />

        <RoundColumn matches={r16L} round="round16" teamMap={teamMap}
          onPick={pick} label={t.stage_r16} labelAlign="right" />
        <Connector sourceCount={4} side="left" />

        <RoundColumn matches={qfL} round="quarters" teamMap={teamMap}
          onPick={pick} label={t.stage_qf} labelAlign="right" />
        <Connector sourceCount={2} side="left" />

        <RoundColumn matches={sfL} round="semis" teamMap={teamMap}
          onPick={pick} label={t.stage_sf} labelAlign="right" />
        <Connector sourceCount={1} side="left" />

        {/* ── CENTER: Final + Champion ────────── */}
        <div className="flex flex-col items-center shrink-0 px-2 self-end">
          <div className="flex flex-col items-center justify-center" style={{ height: TOTAL_H }}>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-pitch">
                {t.stage_final}
              </span>
              {bracket.final && (
                <MatchCard
                  match={bracket.final}
                  teamMap={teamMap}
                  onPick={(id, w) => pick("final", id, w)}
                />
              )}

              {champion && (
                <motion.div
                  key={champion.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative flex flex-col items-center gap-1.5 bg-gradient-to-b from-yellow-300/15 to-amber-500/10 border-2 border-amber-400/60 rounded px-4 py-3 shadow-[0_0_28px_-4px_rgba(251,191,36,0.5)]"
                >
                  <Trophy className="w-6 h-6 text-amber-300" />
                  <CountryFlag code={champion.code} size={28} />
                  <span className="font-bold text-amber-200 text-xs text-center max-w-[110px] leading-tight">
                    {teamName(champion, locale)}
                  </span>
                  <span className="text-[10px] text-amber-300/80 tracking-widest font-bold">
                    {t.champion}
                  </span>
                </motion.div>
              )}

              {bracket.third_place && (
                <div className="mt-2 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted">{t.stage_3rd}</span>
                  <MatchCard
                    match={bracket.third_place}
                    teamMap={teamMap}
                    onPick={(id, w) => pick("third_place", id, w)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: SF → R32 ────────────────── */}
        <Connector sourceCount={1} side="right" />
        <RoundColumn matches={sfR} round="semis" teamMap={teamMap}
          onPick={pick} label={t.stage_sf} labelAlign="left" />

        <Connector sourceCount={2} side="right" />
        <RoundColumn matches={qfR} round="quarters" teamMap={teamMap}
          onPick={pick} label={t.stage_qf} labelAlign="left" />

        <Connector sourceCount={4} side="right" />
        <RoundColumn matches={r16R} round="round16" teamMap={teamMap}
          onPick={pick} label={t.stage_r16} labelAlign="left" />

        <Connector sourceCount={8} side="right" />
        <RoundColumn matches={r32R} round="round32" teamMap={teamMap}
          onPick={pick} label={t.stage_r32} labelAlign="left" />

      </div>
    </div>
  );
}
