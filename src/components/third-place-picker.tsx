"use client";

import { useEffect, useMemo } from "react";
import { Shuffle, RotateCcw, ChevronUp } from "lucide-react";
import { usePredictionStore, Team } from "@/store/prediction-store";
import { CountryFlag } from "@/components/country-flag";
import { useLocale } from "next-intl";
import { teamName, strings } from "@/i18n/page-strings";

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"] as const;
const ADVANCE = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function TeamCard({
  team,
  groupLetter,
  selected,
  onToggle,
}: {
  team: Team;
  groupLetter: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const locale = useLocale();

  return (
    <button
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded border transition-all select-none
        ${selected
          ? "bg-pitch/10 border-pitch/40 hover:border-pitch/60 shadow-[0_0_12px_-3px_rgba(0,177,64,0.3)]"
          : "bg-surface/50 border-line/10 opacity-50 hover:opacity-80 hover:border-line/30"}`}
    >
      {/* selected indicator */}
      {selected && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-pitch flex items-center justify-center">
          <ChevronUp className="w-2.5 h-2.5 text-bg" />
        </span>
      )}

      {/* flag */}
      <CountryFlag code={team.code} size={28} />

      {/* name */}
      <span className="text-xs font-medium text-fg text-center leading-tight truncate w-full">
        {teamName(team, locale)}
      </span>

      {/* group tag */}
      <span className="text-[9px] tabular-nums font-bold text-muted/60">
        3{groupLetter}
      </span>
    </button>
  );
}

export function ThirdPlacePicker() {
  const locale = useLocale();
  const t = strings(locale);
  const { teams, groups, thirdPlaceQualifiers, setThirdPlaceQualifiers } = usePredictionStore();

  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const groupOfId = useMemo(() => {
    const m = new Map<number, string>();
    for (const l of GROUPS) {
      const id = groups[l]?.[2];
      if (id !== undefined) m.set(id, l);
    }
    return m;
  }, [groups]);

  // All third-placed teams (one per group that has standings)
  const allThirds = useMemo(
    () =>
      GROUPS.map((l) => groups[l]?.[2]).filter(
        (id): id is number => id !== undefined
      ),
    [groups]
  );

  // On mount / when groups change, sync qualifiers
  useEffect(() => {
    const valid = new Set(allThirds);
    const filtered = thirdPlaceQualifiers.filter((id) => valid.has(id));
    // Keep only valid selected ones (max ADVANCE)
    if (
      filtered.length !== thirdPlaceQualifiers.length ||
      filtered.some((id, i) => id !== thirdPlaceQualifiers[i])
    ) {
      setThirdPlaceQualifiers(filtered.slice(0, ADVANCE));
    }
  }, [allThirds, thirdPlaceQualifiers, setThirdPlaceQualifiers]);

  // Selected set for fast lookup
  const selectedSet = useMemo(
    () => new Set(thirdPlaceQualifiers),
    [thirdPlaceQualifiers]
  );

  function toggleTeam(id: number) {
    if (selectedSet.has(id)) {
      // Deselect
      setThirdPlaceQualifiers(thirdPlaceQualifiers.filter((x) => x !== id));
    } else if (thirdPlaceQualifiers.length < ADVANCE) {
      // Select (add to end)
      setThirdPlaceQualifiers([...thirdPlaceQualifiers, id]);
    }
  }

  function selectRandom() {
    setThirdPlaceQualifiers(shuffle(allThirds).slice(0, ADVANCE));
  }

  function resetSelection() {
    setThirdPlaceQualifiers(allThirds.slice(0, ADVANCE));
  }

  // All third-place teams as Team objects
  const allThirdTeams: Team[] = allThirds
    .map((id) => teamMap.get(id))
    .filter((t): t is Team => !!t);

  if (allThirds.length === 0) {
    return (
      <div className="bg-surface border border-line/15 rounded p-6 text-center text-muted text-sm">
        {t.tpp_empty}
      </div>
    );
  }

  const selectedCount = thirdPlaceQualifiers.length;

  return (
    <div className="bg-surface border border-line/15 rounded p-5 sm:p-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-line/10">
        <div>
          <h3 className="font-heading font-bold text-lg text-fg">
            {t.tpp_title}
          </h3>
          <p className="text-muted text-sm">
            {t.tpp_subtitle_pre} <span className="text-pitch font-bold">{ADVANCE}</span> {t.tpp_subtitle_post}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`tabular-nums font-heading font-bold text-sm px-3 py-1.5 rounded border
            ${selectedCount === ADVANCE
              ? "border-pitch/40 bg-pitch/10 text-pitch"
              : "border-yellow-400/40 bg-yellow-400/10 text-yellow-300"}`}>
            {selectedCount}/{ADVANCE}
          </span>
          <button
            onClick={selectRandom}
            disabled={allThirds.length < ADVANCE}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-line/15 text-muted hover:text-fg hover:bg-line/5 disabled:opacity-30 transition-colors"
            title={t.tpp_random_title}
          >
            <Shuffle className="w-3.5 h-3.5" />
            {t.tpp_random}
          </button>
          <button
            onClick={resetSelection}
            disabled={allThirds.length === 0}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-line/15 text-muted hover:text-fg hover:bg-line/5 disabled:opacity-30 transition-colors"
            title={t.tpp_reset_title}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.tpp_reset}
          </button>
        </div>
      </div>

      {/* cards grid — click to select/deselect */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {allThirdTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            groupLetter={groupOfId.get(team.id) ?? "?"}
            selected={selectedSet.has(team.id)}
            onToggle={() => toggleTeam(team.id)}
          />
        ))}
      </div>

      {selectedCount < ADVANCE && (
        <p className="text-center text-yellow-300/70 text-xs mt-3">
          {locale === "ru"
            ? `Выбери ещё ${ADVANCE - selectedCount}`
            : `Select ${ADVANCE - selectedCount} more`}
        </p>
      )}
    </div>
  );
}
