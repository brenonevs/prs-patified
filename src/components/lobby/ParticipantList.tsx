"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ParticipantUser = {
  id: string;
  name: string | null;
  image: string | null;
  steamUsername: string | null;
};

export type Participant = {
  userId: string;
  isReady: boolean;
  user: ParticipantUser;
};

type ParticipantListProps = {
  participants: Participant[];
  currentUserId: string;
  hostId: string;
  className?: string;
};

export function ParticipantList({
  participants,
  currentUserId,
  hostId,
  className,
}: ParticipantListProps) {
  return (
    <ul className={cn("space-y-2", className)}>
      {participants.map((p) => {
        const displayName =
          p.user.steamUsername ?? p.user.name ?? "Jogador";
        const isHost = p.userId === hostId;
        const isCurrentUser = p.userId === currentUserId;
        return (
          <li
            key={p.userId}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-2",
              isCurrentUser && "border-primary/50 bg-primary/5"
            )}
          >
            <Avatar className="size-9">
              <AvatarImage src={p.user.image ?? undefined} />
              <AvatarFallback>
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {displayName}
                {isHost && (
                  <span className="ml-1 text-xs text-muted-foreground">(host)</span>
                )}
              </p>
              {p.isReady && (
                <p className="text-xs text-green-600 dark:text-green-400">Pronto</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
