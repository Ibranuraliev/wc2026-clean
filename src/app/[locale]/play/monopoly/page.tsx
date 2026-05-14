"use client";

import { useMonopolyStore } from "@/games/monopoly/store";
import { Setup } from "@/games/monopoly/components/setup";
import { Board } from "@/games/monopoly/components/board-view";
import { ActionPanel, PlayerList, EventLog } from "@/games/monopoly/components/action-panel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "next-intl";

export default function MonopolyPage() {
  const locale = useLocale();
  const phase = useMonopolyStore((s) => s.phase);

  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-pitch mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> К прогнозу ЧМ
        </Link>

        {phase === "setup" ? (
          <Setup />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="min-w-0">
              <Board />
            </div>
            <div className="flex flex-col gap-4">
              <ActionPanel />
              <PlayerList />
              <EventLog />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
