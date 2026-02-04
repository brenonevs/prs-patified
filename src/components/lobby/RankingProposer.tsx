"use client";

import { useState, useId } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

export type RankingEntry = {
  id: string;
  userId?: string;
  playerName: string;
  isGuest?: boolean;
};

type RankingProposerProps = {
  lobbyId: string;
  participants: { userId: string; user: { id: string; steamUsername: string | null; name: string | null } }[];
  currentVersion: number;
  onProposed: () => void;
};

function SortableItem({
  id,
  entry,
  onNameChange,
  onRemove,
}: {
  id: string;
  entry: RankingEntry;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-3 py-2 touch-none",
        isDragging && "opacity-80 shadow-md z-10 bg-background"
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
        {...attributes}
        {...listeners}
        aria-label="Arrastar"
      >
        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </button>
      {entry.isGuest ? (
        <Input
          value={entry.playerName}
          onChange={(e) => onNameChange(entry.id, e.target.value)}
          placeholder="Nome do convidado"
          className="flex-1 font-medium h-8"
        />
      ) : (
        <span className="flex-1 font-medium truncate">{entry.playerName}</span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(entry.id)}
        aria-label="Remover"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}

export function RankingProposer({
  lobbyId,
  participants,
  currentVersion,
  onProposed,
}: RankingProposerProps) {
  const uid = useId();
  const [order, setOrder] = useState<RankingEntry[]>(() =>
    participants.map((p) => ({
      id: p.userId,
      userId: p.userId,
      playerName: p.user.steamUsername ?? p.user.name ?? "?",
      isGuest: false,
    }))
  );
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const from = prev.findIndex((e) => e.id === active.id);
      const to = prev.findIndex((e) => e.id === over.id);
      if (from === -1 || to === -1) return prev;
      return arrayMove(prev, from, to);
    });
  };

  const handleNameChange = (id: string, name: string) => {
    setOrder((prev) =>
      prev.map((e) => (e.id === id ? { ...e, playerName: name } : e))
    );
  };

  const handleRemove = (id: string) => {
    setOrder((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddGuest = () => {
    const name = guestName.trim() || "Convidado";
    setOrder((prev) => [
      ...prev,
      {
        id: `guest-${uid}-${Date.now()}`,
        playerName: name,
        isGuest: true,
      },
    ]);
    setGuestName("");
  };

  const handleSubmit = async () => {
    if (order.length === 0) return;
    const ranking = order.map((entry, index) => ({
      position: index + 1,
      userId: entry.userId ?? undefined,
      playerName: entry.playerName?.trim() || "Convidado",
    }));
    if (ranking.some((e) => !e.playerName || e.playerName === "?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}/voting/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ranking }),
      });
      if (res.ok) onProposed();
    } finally {
      setSubmitting(false);
    }
  };

  const ids = order.map((e) => e.id);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Arraste para reordenar. Participantes do lobby e convidados (não cadastrados) podem aparecer no ranking. Adicione convidados abaixo se precisar.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {order.map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-2">
                <span className="text-muted-foreground w-6 text-sm shrink-0">
                  {index + 1}º
                </span>
                <SortableItem
                  id={entry.id}
                  entry={entry}
                  onNameChange={handleNameChange}
                  onRemove={handleRemove}
                />
              </div>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <div className="flex gap-2">
        <Input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Nome do convidado"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddGuest())}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddGuest}
          className="shrink-0"
        >
          <Plus className="size-4 mr-1" />
          Adicionar convidado
        </Button>
      </div>
      <Button onClick={handleSubmit} disabled={submitting || order.length === 0}>
        {submitting ? "Enviando…" : "Propor ranking"}
      </Button>
    </div>
  );
}
