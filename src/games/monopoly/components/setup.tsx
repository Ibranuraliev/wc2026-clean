"use client";

import { useState } from "react";
import { Plus, X, Play } from "lucide-react";
import { AVATARS, useMonopolyStore } from "../store";
import type { Avatar } from "../types";

interface Draft { name: string; avatar: Avatar; isBot: boolean }

export function Setup() {
  const startGame = useMonopolyStore((s) => s.startGame);
  const [players, setPlayers] = useState<Draft[]>([
    { name: "Игрок 1", avatar: "ball", isBot: false },
    { name: "Бот",     avatar: "trophy", isBot: true },
  ]);

  function add() {
    if (players.length >= 5) return;
    const usedAvatars = new Set(players.map((p) => p.avatar));
    const free = AVATARS.find((a) => !usedAvatars.has(a.id))?.id ?? "ball";
    setPlayers([...players, { name: `Игрок ${players.length + 1}`, avatar: free, isBot: false }]);
  }
  function remove(i: number) {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, idx) => idx !== i));
  }
  function update(i: number, patch: Partial<Draft>) {
    setPlayers(players.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-4xl text-fg mb-2">⚽ FIFA Монополия</h1>
      <p className="text-muted text-sm mb-8">
        2-5 игроков. Выкупай страны, строй базы и стадионы, обанкроть всех соперников и стань чемпионом турнира.
      </p>

      <div className="bg-surface border border-line/15 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-fg">Игроки ({players.length}/5)</h2>
          <button
            onClick={add}
            disabled={players.length >= 5}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-line/15 text-muted hover:text-pitch hover:border-pitch/40 disabled:opacity-30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {players.map((p, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-bg border border-line/10">
              <select
                value={p.avatar}
                onChange={(e) => update(i, { avatar: e.target.value as Avatar })}
                className="bg-transparent border border-line/15 rounded-lg px-2 py-1.5 text-sm text-fg focus:outline-none focus:border-pitch/50 cursor-pointer"
              >
                {AVATARS.map((a) => (
                  <option key={a.id} value={a.id} disabled={players.some((pp, ii) => ii !== i && pp.avatar === a.id)}>
                    {a.emoji} {a.nameRu}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value.slice(0, 20) })}
                className="flex-1 bg-transparent border border-line/15 rounded-lg px-3 py-1.5 text-sm text-fg focus:outline-none focus:border-pitch/50"
                placeholder={`Игрок ${i + 1}`}
              />
              <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={p.isBot}
                  onChange={(e) => update(i, { isBot: e.target.checked })}
                  className="accent-[#00B140]"
                />
                Бот
              </label>
              <button
                onClick={() => remove(i)}
                disabled={players.length <= 2}
                className="text-muted/40 hover:text-red-500 disabled:opacity-30 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => startGame(players)}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-pitch hover:bg-accent text-bg font-heading font-bold py-3 rounded-xl text-sm transition-colors shadow-[0_0_24px_-6px_rgba(0,177,64,0.7)]"
        >
          <Play className="w-4 h-4" /> Начать матч
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
        <div className="bg-surface border border-line/10 rounded-xl p-4">
          <p className="text-pitch font-bold mb-1">⚽ Кубики</p>
          <p>Бросаешь два, двигаешься. Дубль = бонусный ход.</p>
        </div>
        <div className="bg-surface border border-line/10 rounded-xl p-4">
          <p className="text-pitch font-bold mb-1">🏟️ Стадионы</p>
          <p>Соберёшь группу — построй базу (×2 аренда), потом стадион (×5).</p>
        </div>
        <div className="bg-surface border border-line/10 rounded-xl p-4">
          <p className="text-pitch font-bold mb-1">🟥 Красная карточка</p>
          <p>3 хода в раздевалке или $50 штраф / выбить дубль.</p>
        </div>
      </div>
    </div>
  );
}
