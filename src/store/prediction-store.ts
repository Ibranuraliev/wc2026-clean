import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Team {
  id: number;
  code: string;
  name_ru: string;
  name_en: string;
  flag_emoji: string | null;
  group_letter: string | null;
}

export type GroupStandings = Record<string, number[]>;

export interface BracketMatch {
  id: string;
  teamA: number | null;
  teamB: number | null;
  winner: number | null;
}

export type BracketRound = BracketMatch[];

export interface BracketState {
  round32: BracketRound;
  round16: BracketRound;
  quarters: BracketRound;
  semis: BracketRound;
  final: BracketMatch | null;
  third_place: BracketMatch | null;
  champion: number | null;
}

interface PredictionState {
  teams: Team[];
  groups: GroupStandings;
  /** User-ranked third-placed teams (1-12). Top 8 advance to the R32. */
  thirdPlaceQualifiers: number[];
  bracket: BracketState;
  isDirty: boolean;
  setTeams: (teams: Team[]) => void;
  setGroupStandings: (group: string, teamIds: number[]) => void;
  setThirdPlaceQualifiers: (ids: number[]) => void;
  setBracketWinner: (round: string, matchId: string, winnerId: number) => void;
  setChampion: (teamId: number) => void;
  buildBracketFromGroups: () => void;
  resetDirty: () => void;
  reset: () => void;
}

const EMPTY_BRACKET: BracketState = {
  round32: [],
  round16: [],
  quarters: [],
  semis: [],
  final: null,
  third_place: null,
  champion: null,
};

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"] as const;

type Slot = ["W" | "R" | "T", number];
const R32_PAIRS: [Slot, Slot][] = [
  [["W", 0],  ["R", 2]],
  [["W", 5],  ["T", 2]],
  [["W", 2],  ["T", 3]],
  [["R", 3],  ["R", 4]],
  [["W", 4],  ["R", 7]],
  [["W", 6],  ["T", 0]],
  [["W", 1],  ["T", 1]],
  [["R", 5],  ["R", 8]],
  [["W", 7],  ["R", 10]],
  [["R", 9],  ["R", 11]],
  [["W", 8],  ["T", 5]],
  [["W", 11], ["R", 0]],
  [["W", 9],  ["R", 1]],
  [["W", 3],  ["T", 4]],
  [["W", 10], ["T", 7]],
  [["R", 6],  ["T", 6]],
];

function resolveSlot(
  slot: Slot,
  groups: GroupStandings,
  thirdPlaceQualifiers: number[]
): number | null {
  const [kind, idx] = slot;
  if (kind === "W") return groups[GROUPS[idx]]?.[0] ?? null;
  if (kind === "R") return groups[GROUPS[idx]]?.[1] ?? null;
  return thirdPlaceQualifiers[idx] ?? null;
}

function rebuildR32Preserving(
  prev: BracketRound,
  groups: GroupStandings,
  thirdPlaceQualifiers: number[]
): BracketRound {
  return R32_PAIRS.map(([a, b], i) => {
    const teamA = resolveSlot(a, groups, thirdPlaceQualifiers);
    const teamB = resolveSlot(b, groups, thirdPlaceQualifiers);
    const old = prev[i];
    const keepWinner =
      old && old.winner !== null && (old.winner === teamA || old.winner === teamB);
    return {
      id: `r32-${i}`,
      teamA,
      teamB,
      winner: keepWinner ? old.winner : null,
    };
  });
}

function ensureBracketShape(b: BracketState): BracketState {
  return {
    round32: b.round32,
    round16:
      b.round16.length === 8
        ? b.round16
        : Array.from({ length: 8 }, (_, i) => ({
            id: `r16-${i}`, teamA: null, teamB: null, winner: null,
          })),
    quarters:
      b.quarters.length === 4
        ? b.quarters
        : Array.from({ length: 4 }, (_, i) => ({
            id: `qf-${i}`, teamA: null, teamB: null, winner: null,
          })),
    semis:
      b.semis.length === 2
        ? b.semis
        : Array.from({ length: 2 }, (_, i) => ({
            id: `sf-${i}`, teamA: null, teamB: null, winner: null,
          })),
    final: b.final ?? { id: "final", teamA: null, teamB: null, winner: null },
    third_place: b.third_place ?? { id: "third", teamA: null, teamB: null, winner: null },
    champion: b.champion,
  };
}

function propagate(b: BracketState): BracketState {
  const next: BracketState = {
    ...b,
    round16: b.round16.map((m) => ({ ...m })),
    quarters: b.quarters.map((m) => ({ ...m })),
    semis: b.semis.map((m) => ({ ...m })),
    final: b.final ? { ...b.final } : null,
    third_place: b.third_place ? { ...b.third_place } : null,
  };

  function placeIntoNext(target: BracketMatch, slotKey: "teamA" | "teamB", id: number | null) {
    if (target[slotKey] === id) return;
    target[slotKey] = id;
    if (target.winner !== id && target.winner !== null) target.winner = null;
  }

  for (let i = 0; i < next.round32.length; i++) {
    const target = next.round16[Math.floor(i / 2)];
    if (!target) continue;
    placeIntoNext(target, i % 2 === 0 ? "teamA" : "teamB", next.round32[i].winner);
  }
  for (let i = 0; i < next.round16.length; i++) {
    const target = next.quarters[Math.floor(i / 2)];
    if (!target) continue;
    placeIntoNext(target, i % 2 === 0 ? "teamA" : "teamB", next.round16[i].winner);
  }
  for (let i = 0; i < next.quarters.length; i++) {
    const target = next.semis[Math.floor(i / 2)];
    if (!target) continue;
    placeIntoNext(target, i % 2 === 0 ? "teamA" : "teamB", next.quarters[i].winner);
  }
  if (next.final) {
    for (let i = 0; i < next.semis.length; i++) {
      const m = next.semis[i];
      const slotKey: "teamA" | "teamB" = i === 0 ? "teamA" : "teamB";
      placeIntoNext(next.final, slotKey, m.winner);
      if (next.third_place) {
        const loser =
          m.winner === null ? null : m.teamA === m.winner ? m.teamB : m.teamA;
        placeIntoNext(next.third_place, slotKey, loser);
      }
    }
  }
  next.champion = next.final?.winner ?? null;

  return next;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      teams: [],
      groups: {},
      thirdPlaceQualifiers: [],
      bracket: EMPTY_BRACKET,
      isDirty: false,

      setTeams: (teams) => set({ teams }),

      setGroupStandings: (group, teamIds) =>
        set((s) => {
          const groups = { ...s.groups, [group]: teamIds };
          const round32 = rebuildR32Preserving(s.bracket.round32, groups, s.thirdPlaceQualifiers);
          const next = ensureBracketShape({ ...s.bracket, round32 });
          return { groups, bracket: propagate(next), isDirty: true };
        }),

      setThirdPlaceQualifiers: (ids) =>
        set((s) => {
          const round32 = rebuildR32Preserving(s.bracket.round32, s.groups, ids);
          const next = ensureBracketShape({ ...s.bracket, round32 });
          return { thirdPlaceQualifiers: ids, bracket: propagate(next), isDirty: true };
        }),

      setBracketWinner: (round, matchId, winnerId) =>
        set((s) => {
          const b = s.bracket;
          let next: BracketState;
          if (round === "final" && b.final) {
            next = { ...b, final: { ...b.final, winner: winnerId }, champion: winnerId };
          } else if (round === "third_place" && b.third_place) {
            next = { ...b, third_place: { ...b.third_place, winner: winnerId } };
          } else {
            const key = round as keyof Pick<BracketState, "round32" | "round16" | "quarters" | "semis">;
            next = {
              ...b,
              [key]: (b[key] as BracketRound).map((m) =>
                m.id === matchId ? { ...m, winner: winnerId } : m
              ),
            };
          }
          return { bracket: propagate(next), isDirty: true };
        }),

      setChampion: (teamId) =>
        set((s) => ({ bracket: { ...s.bracket, champion: teamId }, isDirty: true })),

      buildBracketFromGroups: () => {
        const { groups, thirdPlaceQualifiers } = get();
        const round32: BracketRound = R32_PAIRS.map(([a, b], i) => ({
          id: `r32-${i}`,
          teamA: resolveSlot(a, groups, thirdPlaceQualifiers),
          teamB: resolveSlot(b, groups, thirdPlaceQualifiers),
          winner: null,
        }));
        const round16: BracketRound = Array.from({ length: 8 }, (_, i) => ({
          id: `r16-${i}`, teamA: null, teamB: null, winner: null,
        }));
        const quarters: BracketRound = Array.from({ length: 4 }, (_, i) => ({
          id: `qf-${i}`, teamA: null, teamB: null, winner: null,
        }));
        const semis: BracketRound = Array.from({ length: 2 }, (_, i) => ({
          id: `sf-${i}`, teamA: null, teamB: null, winner: null,
        }));
        const final: BracketMatch = { id: "final", teamA: null, teamB: null, winner: null };
        const third_place: BracketMatch = { id: "third", teamA: null, teamB: null, winner: null };
        set({
          bracket: { round32, round16, quarters, semis, final, third_place, champion: null },
          isDirty: true,
        });
      },

      resetDirty: () => set({ isDirty: false }),
      reset: () => set({ groups: {}, thirdPlaceQualifiers: [], bracket: EMPTY_BRACKET, isDirty: false }),
    }),
    {
      // Bump the key when team data or schema changes so stale state is wiped.
      name: "wc2026-prediction-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
