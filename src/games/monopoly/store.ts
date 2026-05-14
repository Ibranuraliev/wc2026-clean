import { create } from "zustand";
import { BOARD, KICKOFF_BONUS, RED_CARD_FINE, RED_CARD_INDEX, STARTING_CASH, isCountry, tileAt } from "./board";
import { MATCH_EVENT_CARDS } from "./cards";
import type { Avatar, GamePhase, LandingEvent, MatchEventCard, Player, Tile } from "./types";
import { sfxBoo, sfxBuy, sfxCardDraw, sfxFanfare, sfxGoal, sfxRedCard, sfxWhistle, sfxYellowCard } from "./sounds";

interface AvatarSpec { id: Avatar; emoji: string; color: string; nameRu: string; nameEn: string }

export const AVATARS: AvatarSpec[] = [
  { id: "ball",    emoji: "⚽", color: "#FFFFFF", nameRu: "Мяч",            nameEn: "Ball" },
  { id: "captain", emoji: "👑", color: "#FFD700", nameRu: "Капитан",        nameEn: "Captain" },
  { id: "gloves",  emoji: "🥅", color: "#3DDC84", nameRu: "Вратарь",        nameEn: "Goalkeeper" },
  { id: "trophy",  emoji: "🏆", color: "#FF6B35", nameRu: "Трофей",         nameEn: "Trophy" },
  { id: "whistle", emoji: "🟨", color: "#FFEB3B", nameRu: "Свисток судьи",  nameEn: "Referee" },
];

export interface GameLogEntry {
  id: number;
  text: string;
  ts: number;
  kind?: "move" | "buy" | "rent" | "card" | "info" | "danger" | "good";
}

interface OwnerInfo {
  ownerId: string;
  /** Number of training bases (0..4). 5 = stadium. */
  buildings: number;
  mortgaged: boolean;
}

interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIdx: number;
  ownership: Record<number, OwnerInfo>;   // tileIndex → owner
  dice: [number, number] | null;
  doubleNextRoll: boolean;
  skipNextTurn: Record<string, boolean>;
  pendingEvent: LandingEvent | null;
  drawnCard: MatchEventCard | null;
  log: GameLogEntry[];
  /** Used so VAR can undo the last purchase. */
  lastPurchase: { playerId: string; tileIndex: number; price: number } | null;
  startedAt: number | null;
  winnerId: string | null;

  // ── actions ──
  startGame: (players: { name: string; avatar: Avatar; isBot: boolean }[]) => void;
  rollDice: () => void;
  buyCurrentTile: () => void;
  declineBuy: () => void;
  endTurn: () => void;
  reset: () => void;
  _resolveLanding: () => void;
  _sendToRedCard: () => void;
  _applyCard: (card: MatchEventCard) => void;
}

let _logId = 1;

function makeLog(text: string, kind: GameLogEntry["kind"] = "info"): GameLogEntry {
  return { id: _logId++, text, ts: Date.now(), kind };
}

function getCurrentPlayer(s: GameState): Player {
  return s.players[s.currentPlayerIdx];
}

function rentFor(tileIndex: number, ownership: Record<number, OwnerInfo>, players: Player[], diceTotal: number): number {
  const tile = tileAt(tileIndex);
  const o = ownership[tileIndex];
  if (!o || o.mortgaged) return 0;
  if (tile.kind === "country" && isCountry(tile)) {
    const lvl = Math.min(o.buildings, 5);
    return tile.rent[lvl] ?? tile.rent[0];
  }
  if (tile.kind === "stadium") {
    const owner = players.find((p) => p.id === o.ownerId);
    if (!owner) return 0;
    const stadiumsOwned = owner.ownedTileIndices
      .filter((i) => tileAt(i).kind === "stadium" && !ownership[i].mortgaged)
      .length;
    return [0, 25, 50, 100, 200][Math.min(stadiumsOwned, 4)];
  }
  if (tile.kind === "broadcaster") {
    const owner = players.find((p) => p.id === o.ownerId);
    if (!owner) return 0;
    const ownedBroadcasters = owner.ownedTileIndices
      .filter((i) => tileAt(i).kind === "broadcaster" && !ownership[i].mortgaged)
      .length;
    const multiplier = ownedBroadcasters === 2 ? 10 : 4;
    return diceTotal * multiplier;
  }
  return 0;
}

const PALETTE = ["#FF3B30", "#3DDC84", "#3C3B6E", "#FF9500", "#9370DB"];

export const useMonopolyStore = create<GameState>()((set, get) => ({
  phase: "setup",
  players: [],
  currentPlayerIdx: 0,
  ownership: {},
  dice: null,
  doubleNextRoll: false,
  skipNextTurn: {},
  pendingEvent: null,
  drawnCard: null,
  log: [],
  lastPurchase: null,
  startedAt: null,
  winnerId: null,

  startGame(playersInput) {
    const players: Player[] = playersInput.map((p, i) => ({
      id: `p${i}`,
      name: p.name.trim() || `Игрок ${i + 1}`,
      avatar: p.avatar,
      color: PALETTE[i % PALETTE.length],
      cash: STARTING_CASH,
      position: 0,
      ownedTileIndices: [],
      inRedCard: false,
      redCardTurnsLeft: 0,
      bankrupt: false,
      isBot: p.isBot,
    }));
    set({
      phase: "rolling",
      players,
      currentPlayerIdx: 0,
      ownership: {},
      dice: null,
      log: [makeLog(`Стартовый свисток — игра началась! ${players.length} игроков.`, "good")],
      startedAt: Date.now(),
      pendingEvent: null,
      drawnCard: null,
      lastPurchase: null,
      winnerId: null,
      skipNextTurn: {},
    });
  },

  rollDice() {
    const s = get();
    if (s.phase === "ended") return;
    const cur = getCurrentPlayer(s);
    if (!cur || cur.bankrupt) return;

    sfxWhistle();

    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    let total = d1 + d2;
    if (s.doubleNextRoll) total *= 2;

    // Red card jail: must roll doubles or pay $50 / wait 3 turns.
    if (cur.inRedCard) {
      const escaped = d1 === d2;
      if (!escaped && cur.redCardTurnsLeft > 1) {
        const players = s.players.map((p) =>
          p.id === cur.id ? { ...p, redCardTurnsLeft: p.redCardTurnsLeft - 1 } : p
        );
        set({
          dice: [d1, d2],
          players,
          log: [makeLog(`${cur.name} в раздевалке — не выпал дубль (${cur.redCardTurnsLeft - 1} попытки).`, "danger"), ...s.log],
        });
        // Auto-end turn
        setTimeout(() => get().endTurn(), 600);
        return;
      }
      // Escape (doubles) or last attempt: pay $50 and continue
      const players = s.players.map((p) =>
        p.id === cur.id ? { ...p, inRedCard: false, redCardTurnsLeft: 0, cash: escaped ? p.cash : p.cash - RED_CARD_FINE } : p
      );
      set({
        players,
        log: [makeLog(escaped ? `${cur.name} выбил дубль и вернулся на поле!` : `${cur.name} заплатил $${RED_CARD_FINE} и вернулся.`, "good"), ...s.log],
      });
    }

    // Move
    const oldPos = cur.position;
    let newPos = oldPos + total;
    let kickoffBonus = 0;
    if (newPos >= 40) {
      newPos = newPos % 40;
      kickoffBonus = KICKOFF_BONUS;
      sfxGoal();
    }

    const players = s.players.map((p) =>
      p.id === cur.id ? { ...p, position: newPos, cash: p.cash + kickoffBonus } : p
    );

    const log: GameLogEntry[] = [
      makeLog(`${cur.name} бросил ${d1}+${d2}=${total}${s.doubleNextRoll ? " ×2!" : ""}.`, "move"),
      ...s.log,
    ];
    if (kickoffBonus) {
      log.unshift(makeLog(`${cur.name} прошёл KICK-OFF и получил $${kickoffBonus}!`, "good"));
    }

    set({
      dice: [d1, d2],
      doubleNextRoll: false,
      players,
      log,
      phase: "landed_decision",
    });

    // Resolve landing
    setTimeout(() => get()._resolveLanding(), 400);
  },

  _resolveLanding: () => {
    const s = get();
    const cur = getCurrentPlayer(s);
    const tile = tileAt(cur.position);
    const own = s.ownership[cur.position];

    function setEvent(ev: LandingEvent, log: GameLogEntry[]) {
      set({ pendingEvent: ev, log: [...log, ...s.log] });
    }

    if (tile.kind === "country" || tile.kind === "stadium" || tile.kind === "broadcaster") {
      if (!own) {
        const price = (tile as { price?: number }).price ?? 0;
        setEvent(
          { kind: "buyable", tileIndex: cur.position, price },
          [makeLog(`${cur.name} остановился на ${tile.label} (цена $${price}).`, "info")]
        );
        return;
      }
      if (own.ownerId === cur.id) {
        setEvent({ kind: "owned_self", tileIndex: cur.position }, [
          makeLog(`${cur.name} на своей территории — ${tile.label}.`, "info"),
        ]);
        return;
      }
      // Pay rent
      const diceTotal = (s.dice?.[0] ?? 0) + (s.dice?.[1] ?? 0);
      const amt = rentFor(cur.position, s.ownership, s.players, diceTotal);
      const owner = s.players.find((p) => p.id === own.ownerId)!;
      const players = s.players.map((p) => {
        if (p.id === cur.id) return { ...p, cash: p.cash - amt };
        if (p.id === owner.id) return { ...p, cash: p.cash + amt };
        return p;
      });
      sfxBoo();
      set({
        players,
        pendingEvent: { kind: "rent_paid", tileIndex: cur.position, from: cur.id, to: owner.id, amount: amt },
        log: [makeLog(`${cur.name} платит ${owner.name} аренду $${amt} за ${tile.label}.`, "rent"), ...s.log],
      });
      return;
    }

    if (tile.kind === "kickoff") {
      setEvent({ kind: "kickoff_pass", bonus: 0 }, [makeLog(`${cur.name} на KICK-OFF.`, "good")]);
      return;
    }
    if (tile.kind === "half_time") {
      setEvent({ kind: "neutral" }, [makeLog(`${cur.name} отдыхает в перерыве.`, "info")]);
      return;
    }
    if (tile.kind === "yellow_card") {
      sfxYellowCard();
      setEvent({ kind: "neutral" }, [makeLog(`${cur.name} получил жёлтую карточку (предупреждение).`, "danger")]);
      return;
    }
    if (tile.kind === "red_card_jail") {
      // Just visiting unless flagged
      setEvent({ kind: "neutral" }, [makeLog(`${cur.name} навещает раздевалку.`, "info")]);
      return;
    }
    if (tile.kind === "go_to_red") {
      get()._sendToRedCard();
      return;
    }
    if (tile.kind === "tax") {
      const amt = (tile as { amount: number }).amount;
      const players = s.players.map((p) =>
        p.id === cur.id ? { ...p, cash: p.cash - amt } : p
      );
      set({
        players,
        pendingEvent: { kind: "tax", amount: amt },
        log: [makeLog(`${cur.name} платит штраф FIFA $${amt}.`, "danger"), ...s.log],
      });
      return;
    }
    if (tile.kind === "chance") {
      sfxCardDraw();
      const card = MATCH_EVENT_CARDS[Math.floor(Math.random() * MATCH_EVENT_CARDS.length)];
      get()._applyCard(card);
      return;
    }
  },

  _sendToRedCard: () => {
    const s = get();
    const cur = getCurrentPlayer(s);
    sfxRedCard();
    const players = s.players.map((p) =>
      p.id === cur.id ? { ...p, position: RED_CARD_INDEX, inRedCard: true, redCardTurnsLeft: 3 } : p
    );
    set({
      players,
      pendingEvent: { kind: "red_card", reason: "Красная карточка!" },
      log: [makeLog(`${cur.name} удалён до конца матча — на 3 хода в раздевалку!`, "danger"), ...s.log],
    });
  },

  _applyCard: (card: MatchEventCard) => {
    const s = get();
    const cur = getCurrentPlayer(s);
    const eff = card.effect;
    let players = [...s.players];
    let log: GameLogEntry[] = [];

    function update(id: string, fn: (p: Player) => Player) {
      players = players.map((p) => (p.id === id ? fn(p) : p));
    }

    log.push(makeLog(`Карта: «${card.title}» — ${card.body}`, "card"));

    switch (eff.type) {
      case "cash":
        update(cur.id, (p) => ({ ...p, cash: p.cash + eff.amount }));
        break;
      case "move":
        update(cur.id, (p) => ({
          ...p,
          position: eff.toIndex,
          cash: p.cash + (eff.collectKickoff && eff.toIndex === 0 ? KICKOFF_BONUS : 0),
        }));
        break;
      case "move_relative":
        update(cur.id, (p) => ({
          ...p,
          position: ((p.position + eff.delta) % 40 + 40) % 40,
        }));
        break;
      case "go_to_red_card":
        set({ players, log: [...log, ...s.log], drawnCard: card });
        get()._sendToRedCard();
        return;
      case "skip_next_turn":
        set({ skipNextTurn: { ...s.skipNextTurn, [cur.id]: true } });
        break;
      case "double_dice_next_roll":
        set({ doubleNextRoll: true });
        break;
      case "pay_each_player": {
        const others = players.filter((p) => p.id !== cur.id && !p.bankrupt);
        const total = eff.amount * others.length;
        update(cur.id, (p) => ({ ...p, cash: p.cash - total }));
        others.forEach((o) => update(o.id, (p) => ({ ...p, cash: p.cash + eff.amount })));
        break;
      }
      case "collect_each_player": {
        const others = players.filter((p) => p.id !== cur.id && !p.bankrupt);
        const total = eff.amount * others.length;
        update(cur.id, (p) => ({ ...p, cash: p.cash + total }));
        others.forEach((o) => update(o.id, (p) => ({ ...p, cash: p.cash - eff.amount })));
        break;
      }
      case "var_undo_last_purchase": {
        const lp = s.lastPurchase;
        if (!lp || lp.playerId !== cur.id) {
          log.push(makeLog("VAR не нашёл что отменить — нет последней покупки.", "info"));
        } else {
          update(cur.id, (p) => ({ ...p, cash: p.cash + lp.price, ownedTileIndices: p.ownedTileIndices.filter((i) => i !== lp.tileIndex) }));
          const own = { ...s.ownership };
          delete own[lp.tileIndex];
          set({ ownership: own });
          log.push(makeLog(`VAR отменил покупку — деньги возвращены.`, "good"));
        }
        break;
      }
    }

    set({
      players,
      drawnCard: card,
      pendingEvent: { kind: "card_drawn", cardId: card.id, effectText: card.body },
      log: [...log, ...s.log],
      lastPurchase: eff.type === "var_undo_last_purchase" ? null : s.lastPurchase,
    });
  },

  buyCurrentTile() {
    const s = get();
    const cur = getCurrentPlayer(s);
    const tile = tileAt(cur.position);
    const price = (tile as { price?: number }).price ?? 0;
    if (cur.cash < price) return;
    sfxBuy();
    const players = s.players.map((p) =>
      p.id === cur.id
        ? { ...p, cash: p.cash - price, ownedTileIndices: [...p.ownedTileIndices, cur.position] }
        : p
    );
    set({
      players,
      ownership: { ...s.ownership, [cur.position]: { ownerId: cur.id, buildings: 0, mortgaged: false } },
      pendingEvent: null,
      lastPurchase: { playerId: cur.id, tileIndex: cur.position, price },
      log: [makeLog(`${cur.name} купил ${tile.label} за $${price}.`, "buy"), ...s.log],
    });
  },

  declineBuy() {
    set((s) => ({
      pendingEvent: null,
      log: [makeLog(`${getCurrentPlayer(s).name} отказался покупать.`, "info"), ...s.log],
    }));
  },

  endTurn() {
    const s = get();
    if (s.phase === "ended") return;

    // Bankruptcy detection
    const players = s.players.map((p) =>
      p.cash < 0 && !p.bankrupt ? { ...p, bankrupt: true } : p
    );
    const alive = players.filter((p) => !p.bankrupt);
    if (alive.length === 1) {
      sfxFanfare();
      set({
        players,
        phase: "ended",
        winnerId: alive[0].id,
        pendingEvent: null,
        log: [makeLog(`🏆 ${alive[0].name} — чемпион ЧМ-Монополии!`, "good"), ...s.log],
      });
      return;
    }

    // Find next non-bankrupt, non-skipped player
    let nextIdx = (s.currentPlayerIdx + 1) % players.length;
    let safety = 0;
    while (safety++ < 10) {
      const np = players[nextIdx];
      if (!np.bankrupt && !s.skipNextTurn[np.id]) break;
      if (s.skipNextTurn[np.id]) {
        // Consume the skip
        const skip = { ...s.skipNextTurn };
        delete skip[np.id];
        set({ skipNextTurn: skip, log: [makeLog(`${np.name} пропускает ход (жёлтая).`, "danger"), ...s.log] });
      }
      nextIdx = (nextIdx + 1) % players.length;
    }

    set({
      players,
      currentPlayerIdx: nextIdx,
      pendingEvent: null,
      drawnCard: null,
      dice: null,
      phase: "rolling",
    });
  },

  reset() {
    set({
      phase: "setup",
      players: [],
      currentPlayerIdx: 0,
      ownership: {},
      dice: null,
      doubleNextRoll: false,
      skipNextTurn: {},
      pendingEvent: null,
      drawnCard: null,
      log: [],
      lastPurchase: null,
      startedAt: null,
      winnerId: null,
    });
  },
}));

// helper for action bar consumers
export function tileLabel(tile: Tile): string { return tile.label; }
