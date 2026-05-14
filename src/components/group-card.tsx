"use client";

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { usePredictionStore, Team } from "@/store/prediction-store";
import { CountryFlag } from "@/components/country-flag";
import { useLocale } from "next-intl";
import { teamName, strings } from "@/i18n/page-strings";

const POS_COLORS = [
  "text-pitch font-bold",
  "text-accent",
  "text-yellow-400/80",
  "text-muted/60",
];
// Top 2 qualify for R32. 3rd place is also highlighted because the
// 8 best 3rd-placed teams advance under the FIFA 2026 format.
const POS_BG = [
  "bg-pitch/10 border-pitch/40",
  "bg-pitch/5 border-pitch/25",
  "bg-yellow-400/5 border-yellow-400/20",
  "",
];

function SortableRow({ team, position }: { team: Team; position: number }) {
  const locale = useLocale();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: team.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 px-3 py-2 rounded transition-all cursor-default
        ${isDragging ? "shadow-lg shadow-black/40 scale-[1.02] bg-surface z-50" : "hover:bg-line/5"}
        ${position < 3 ? "border " + POS_BG[position] : ""}`}
    >
      <span className={`w-5 text-sm tabular-nums ${POS_COLORS[position] ?? "text-muted/60"}`}>
        {position + 1}
      </span>
      <button {...attributes} {...listeners}
        className="text-muted/40 hover:text-fg cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label={strings(locale).drag_aria}>
        <GripVertical className="w-4 h-4" />
      </button>
      <CountryFlag code={team.code} size={18} />
      <span className="text-sm font-medium flex-1 truncate text-fg">{teamName(team, locale)}</span>
      {position < 2 && (
        <span className="text-[10px] bg-pitch/15 text-pitch border border-pitch/40 px-1.5 py-0.5 rounded font-bold shrink-0">
          Q
        </span>
      )}
      {position === 2 && (
        <span
          className="text-[10px] bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 px-1.5 py-0.5 rounded font-bold shrink-0"
          title={strings(locale).third_tooltip}
        >
          3
        </span>
      )}
    </div>
  );
}

export function GroupCard({ letter, teams }: { letter: string; teams: Team[] }) {
  const locale = useLocale();
  const t = strings(locale);
  const { groups, setGroupStandings } = usePredictionStore();
  const ids = groups[letter] ?? teams.map((t) => t.id);
  const ordered = ids.map((id) => teams.find((t) => t.id === id)).filter((t): t is Team => !!t);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oi = ordered.findIndex((t) => t.id === active.id);
    const ni = ordered.findIndex((t) => t.id === over.id);
    setGroupStandings(letter, arrayMove(ordered, oi, ni).map((t) => t.id));
  }

  return (
    <div className="bg-surface rounded border border-line/15 shadow-lg shadow-black/30 p-4 hover:border-pitch/30 hover:shadow-pitch/5 transition-all">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-line/10">
        <span className="w-7 h-7 rounded bg-pitch text-bg font-heading font-bold text-sm flex items-center justify-center shadow-[0_0_18px_-2px_rgba(0,177,64,0.6)]">
          {letter}
        </span>
        <span className="text-xs text-muted font-medium tracking-wide uppercase">{t.group_label} {letter}</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-0.5">
            {ordered.map((team, i) => <SortableRow key={team.id} team={team} position={i} />)}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
