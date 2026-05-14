"use client";

import { BOARD, GROUP_COLORS, isCountry } from "../board";
import { useMonopolyStore, AVATARS } from "../store";
import { CountryFlag } from "@/components/country-flag";

/**
 * 11x11 grid: 40 tiles around the perimeter, decorated centre.
 * Tile order on the perimeter (clockwise starting from bottom-right):
 *   bottom row right→left: 0..10
 *   left column bottom→top: 11..20
 *   top row left→right:    21..30
 *   right column top→bottom: 31..39
 */
const PERIMETER_GRID: Array<{ index: number; row: number; col: number }> = [];
for (let i = 0; i <= 10; i++) PERIMETER_GRID.push({ index: i, row: 10, col: 10 - i });
for (let i = 11; i <= 20; i++) PERIMETER_GRID.push({ index: i, row: 10 - (i - 10), col: 0 });
for (let i = 21; i <= 30; i++) PERIMETER_GRID.push({ index: i, row: 0, col: i - 20 });
for (let i = 31; i <= 39; i++) PERIMETER_GRID.push({ index: i, row: i - 30, col: 10 });

export function Board() {
  const players = useMonopolyStore((s) => s.players);
  const ownership = useMonopolyStore((s) => s.ownership);

  return (
    <div className="relative aspect-square w-full max-w-[680px] mx-auto bg-bg border-2 border-pitch/30 rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,177,64,0.4)]">
      <div className="grid h-full w-full" style={{ gridTemplateColumns: "repeat(11, 1fr)", gridTemplateRows: "repeat(11, 1fr)" }}>
        {PERIMETER_GRID.map(({ index, row, col }) => {
          const tile = BOARD[index];
          const owned = ownership[index];
          const owner = owned ? players.find((p) => p.id === owned.ownerId) : undefined;
          const tilePlayers = players.filter((p) => p.position === index && !p.bankrupt);
          const groupColor = isCountry(tile) ? GROUP_COLORS[tile.groupLetter] : undefined;

          // Corner tiles
          const isCorner = index === 0 || index === 10 || index === 20 || index === 30;

          return (
            <div
              key={index}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              className={`relative bg-surface border border-line/10 ${isCorner ? "p-1" : "p-0.5"} flex flex-col overflow-hidden`}
            >
              {/* Group color stripe at top (countries only) */}
              {groupColor && (
                <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: groupColor }} />
              )}
              <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0">
                {tile.kind === "country" && isCountry(tile) ? (
                  <>
                    <CountryFlag code={tile.fifaCode} size={14} />
                    <span className="text-[8px] font-medium text-fg leading-tight mt-0.5 line-clamp-2 px-0.5">{tile.label}</span>
                    <span className="text-[7px] text-muted tabular-nums">${tile.price}</span>
                  </>
                ) : tile.kind === "kickoff" ? (
                  <span className="text-[10px] font-bold text-pitch">⚽ KICK-OFF</span>
                ) : tile.kind === "red_card_jail" ? (
                  <span className="text-[10px] font-bold text-red-500">🟥</span>
                ) : tile.kind === "half_time" ? (
                  <span className="text-[10px] font-bold text-amber-400">⏸ HT</span>
                ) : tile.kind === "go_to_red" ? (
                  <span className="text-[9px] font-bold text-red-400">→ 🟥</span>
                ) : tile.kind === "stadium" ? (
                  <span className="text-[8px] font-bold text-fg leading-tight">🏟<br/>{tile.label.split(" ")[0]}</span>
                ) : tile.kind === "broadcaster" ? (
                  <span className="text-[8px] font-bold text-fg leading-tight">📺<br/>{tile.label}</span>
                ) : tile.kind === "chance" ? (
                  <span className="text-[14px]">🎲</span>
                ) : tile.kind === "yellow_card" ? (
                  <span className="text-[14px]">🟨</span>
                ) : tile.kind === "tax" ? (
                  <span className="text-[8px] font-bold text-amber-300">💸<br/>${(tile as { amount: number }).amount}</span>
                ) : null}
              </div>
              {/* Owner indicator */}
              {owner && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: owner.color }} />
              )}
              {/* Player tokens */}
              {tilePlayers.length > 0 && (
                <div className="absolute top-0 right-0 flex gap-0.5 p-0.5 flex-wrap max-w-full">
                  {tilePlayers.map((p) => {
                    const av = AVATARS.find((a) => a.id === p.avatar);
                    return (
                      <span
                        key={p.id}
                        className="text-[10px] leading-none rounded-full p-0.5 ring-1"
                        style={{ backgroundColor: p.color + "33", boxShadow: `0 0 0 1px ${p.color}` }}
                        title={p.name}
                      >
                        {av?.emoji ?? "⚽"}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Centre — title and trophy */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-center select-none transform -rotate-12">
          <p className="text-pitch font-heading font-bold text-2xl tracking-tight">FIFA</p>
          <p className="text-fg font-heading font-bold text-3xl tracking-tighter">МОНОПОЛИЯ</p>
          <p className="text-muted text-xs mt-1">2026</p>
          <p className="text-5xl mt-2">🏆</p>
        </div>
      </div>
    </div>
  );
}
