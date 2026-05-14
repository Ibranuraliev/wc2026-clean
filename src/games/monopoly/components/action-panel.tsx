"use client";

import { Dices, Check, X, ChevronRight, Trophy } from "lucide-react";
import { useMonopolyStore, AVATARS } from "../store";
import { tileAt, isCountry } from "../board";

export function ActionPanel() {
  const phase = useMonopolyStore((s) => s.phase);
  const players = useMonopolyStore((s) => s.players);
  const cur = useMonopolyStore((s) => s.players[s.currentPlayerIdx]);
  const dice = useMonopolyStore((s) => s.dice);
  const event = useMonopolyStore((s) => s.pendingEvent);
  const drawn = useMonopolyStore((s) => s.drawnCard);
  const winnerId = useMonopolyStore((s) => s.winnerId);
  const rollDice = useMonopolyStore((s) => s.rollDice);
  const buy = useMonopolyStore((s) => s.buyCurrentTile);
  const decline = useMonopolyStore((s) => s.declineBuy);
  const endTurn = useMonopolyStore((s) => s.endTurn);
  const reset = useMonopolyStore((s) => s.reset);

  if (phase === "ended" && winnerId) {
    const w = players.find((p) => p.id === winnerId);
    const av = AVATARS.find((a) => a.id === w?.avatar);
    return (
      <div className="bg-surface border-2 border-amber-400/50 rounded-2xl p-6 text-center shadow-[0_0_40px_-8px_rgba(251,191,36,0.5)]">
        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-amber-300/80 font-bold tracking-widest mb-2">ЧЕМПИОН МАТЧА</p>
        <p className="text-2xl font-heading font-bold text-fg">
          {av?.emoji} {w?.name}
        </p>
        <p className="text-muted text-xs mt-1 tabular-nums">${w?.cash.toLocaleString()}</p>
        <button onClick={reset} className="mt-4 w-full bg-pitch hover:bg-accent text-bg font-heading font-bold py-2.5 rounded-xl text-sm transition-colors">
          Новый матч
        </button>
      </div>
    );
  }

  if (!cur) return null;
  const av = AVATARS.find((a) => a.id === cur.avatar);

  // Buyable tile event → show buy/decline
  if (event?.kind === "buyable") {
    const tile = tileAt(event.tileIndex);
    return (
      <div className="bg-surface border border-pitch/40 rounded-2xl p-4 shadow-lg">
        <p className="text-[10px] uppercase tracking-widest text-muted mb-2">Свободная клетка</p>
        <p className="font-heading font-bold text-fg text-xl mb-1">{tile.label}</p>
        {isCountry(tile) && <p className="text-xs text-muted">Группа {tile.groupLetter} · ${tile.price}</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={buy}
            disabled={cur.cash < event.price}
            className="flex-1 flex items-center justify-center gap-1.5 bg-pitch hover:bg-accent text-bg font-heading font-semibold py-2.5 rounded-xl text-sm disabled:opacity-30 transition-colors"
          >
            <Check className="w-4 h-4" /> Купить ${event.price}
          </button>
          <button onClick={decline} className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-line/15 text-muted hover:text-fg hover:bg-line/5 rounded-xl text-sm transition-colors">
            <X className="w-4 h-4" /> Отказ
          </button>
        </div>
      </div>
    );
  }

  // Card drawn — show
  if (drawn && event?.kind === "card_drawn") {
    return (
      <div className="bg-gradient-to-br from-pitch/20 to-accent/10 border border-pitch/40 rounded-2xl p-4 shadow-lg">
        <p className="text-[10px] uppercase tracking-widest text-pitch font-bold mb-2">🎲 Матч-событие</p>
        <p className="font-heading font-bold text-fg text-lg mb-1">{drawn.title}</p>
        <p className="text-sm text-muted mb-4">{drawn.body}</p>
        <button onClick={endTurn} className="w-full flex items-center justify-center gap-1.5 bg-pitch hover:bg-accent text-bg font-heading font-semibold py-2.5 rounded-xl text-sm transition-colors">
          <ChevronRight className="w-4 h-4" /> Дальше
        </button>
      </div>
    );
  }

  // Default — current turn
  const showRoll = !dice || event === null;
  return (
    <div className="bg-surface border border-line/15 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="flex items-center justify-center w-9 h-9 rounded-full text-lg ring-2"
          style={{ backgroundColor: cur.color + "33", boxShadow: `0 0 0 2px ${cur.color}` }}
        >
          {av?.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-fg truncate">{cur.name}</p>
          <p className="text-xs text-muted tabular-nums">${cur.cash.toLocaleString()}</p>
        </div>
        {dice && (
          <div className="flex gap-1 text-xl tabular-nums font-heading font-bold text-pitch">
            <span className="w-7 h-7 flex items-center justify-center bg-bg border border-line/15 rounded-md">{dice[0]}</span>
            <span className="w-7 h-7 flex items-center justify-center bg-bg border border-line/15 rounded-md">{dice[1]}</span>
          </div>
        )}
      </div>

      {cur.inRedCard && (
        <p className="text-xs text-red-400 mb-3 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
          🟥 В раздевалке — нужен дубль или $50 штраф ({cur.redCardTurnsLeft} попыток).
        </p>
      )}

      {showRoll ? (
        <button
          onClick={rollDice}
          className="w-full flex items-center justify-center gap-2 bg-pitch hover:bg-accent text-bg font-heading font-bold py-3 rounded-xl text-sm transition-colors shadow-[0_0_24px_-6px_rgba(0,177,64,0.7)]"
        >
          <Dices className="w-4 h-4" /> Бросить кубики
        </button>
      ) : (
        <button
          onClick={endTurn}
          className="w-full flex items-center justify-center gap-2 border border-line/15 text-muted hover:text-fg hover:bg-line/5 py-3 rounded-xl text-sm transition-colors"
        >
          <ChevronRight className="w-4 h-4" /> Завершить ход
        </button>
      )}

      {/* Mini owned-tiles summary */}
      {cur.ownedTileIndices.length > 0 && (
        <div className="mt-3 pt-3 border-t border-line/10">
          <p className="text-[10px] uppercase tracking-widest text-muted mb-1">Владения ({cur.ownedTileIndices.length})</p>
          <div className="flex flex-wrap gap-1">
            {cur.ownedTileIndices.map((idx) => {
              const t = tileAt(idx);
              return (
                <span key={idx} className="text-[10px] bg-bg border border-line/10 rounded px-1.5 py-0.5 text-muted truncate max-w-[100px]">
                  {t.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function PlayerList() {
  const players = useMonopolyStore((s) => s.players);
  const currentIdx = useMonopolyStore((s) => s.currentPlayerIdx);

  return (
    <div className="bg-surface border border-line/15 rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted mb-3">Игроки</p>
      <div className="space-y-2">
        {players.map((p, i) => {
          const av = AVATARS.find((a) => a.id === p.avatar);
          const isCurrent = i === currentIdx && !p.bankrupt;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors
                ${isCurrent ? "bg-pitch/10 border border-pitch/40" : "border border-transparent"}
                ${p.bankrupt ? "opacity-30" : ""}`}
            >
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full text-sm shrink-0"
                style={{ backgroundColor: p.color + "33", boxShadow: `0 0 0 1.5px ${p.color}` }}
              >
                {av?.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg truncate">{p.name}</p>
                <p className="text-[10px] text-muted tabular-nums">${p.cash.toLocaleString()} · {p.ownedTileIndices.length} тер.</p>
              </div>
              {p.inRedCard && <span className="text-xs">🟥</span>}
              {p.bankrupt && <span className="text-xs">💀</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EventLog() {
  const log = useMonopolyStore((s) => s.log);
  return (
    <div className="bg-surface border border-line/15 rounded-2xl p-4 max-h-72 overflow-y-auto">
      <p className="text-[10px] uppercase tracking-widest text-muted mb-2 sticky top-0 bg-surface pb-1">Лента матча</p>
      <div className="space-y-1">
        {log.slice(0, 25).map((e) => (
          <p
            key={e.id}
            className={`text-xs leading-snug
              ${e.kind === "good" ? "text-pitch" : ""}
              ${e.kind === "danger" ? "text-red-400" : ""}
              ${e.kind === "card" ? "text-amber-300" : ""}
              ${e.kind === "rent" ? "text-orange-300" : ""}
              ${e.kind === "buy" ? "text-fg" : ""}
              ${!e.kind || e.kind === "info" || e.kind === "move" ? "text-muted" : ""}`}
          >
            {e.text}
          </p>
        ))}
      </div>
    </div>
  );
}
