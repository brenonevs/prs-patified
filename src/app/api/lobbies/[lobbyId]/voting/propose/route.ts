import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pusher, getLobbyChannelName } from "@/lib/pusher-server";

export const dynamic = "force-dynamic";

type RankingEntry = { position: number; userId?: string; playerName: string };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lobbyId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { lobbyId } = await params;
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: {
      participants: {
        where: { leftAt: null },
        include: {
          user: { select: { id: true, steamUsername: true, name: true } },
        },
      },
      proposedRanking: { orderBy: [{ version: "desc" }], take: 1 },
    },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  if (lobby.status !== "VOTING") {
    return NextResponse.json(
      { error: "Proposta de ranking só na fase de votação." },
      { status: 400 }
    );
  }

  const isParticipant = lobby.participants.some(
    (p) => p.userId === session.user.id
  );
  if (!isParticipant) {
    return NextResponse.json({ error: "Você não está neste lobby." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const ranking = Array.isArray(body.ranking) ? body.ranking as RankingEntry[] : [];

  if (ranking.length === 0) {
    return NextResponse.json(
      { error: "Envie o ranking (array de { position, userId?, playerName })." },
      { status: 400 }
    );
  }

  const sorted = [...ranking].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
  const participantIds = new Set(lobby.participants.map((p) => p.userId));
  const namesByUserId = new Map(
    lobby.participants.map((p) => [
      p.user.id,
      p.user.steamUsername ?? p.user.name ?? "?",
    ])
  );

  for (const entry of sorted) {
    if (!entry.playerName?.trim() && !entry.userId) {
      return NextResponse.json(
        { error: "Cada posição deve ter userId ou playerName." },
        { status: 400 }
      );
    }
    if (entry.userId && !participantIds.has(entry.userId)) {
      return NextResponse.json(
        { error: "Apenas participantes do lobby podem estar no ranking." },
        { status: 400 }
      );
    }
  }

  const nextVersion =
    (lobby.proposedRanking[0]?.version ?? 0) + 1;

  await prisma.lobbyVote.deleteMany({
    where: { lobbyId, version: { lt: nextVersion } },
  });

  await prisma.lobbyProposedRanking.createMany({
    data: sorted.map((entry, index) => ({
      lobbyId,
      proposedById: session.user.id,
      position: index + 1,
      userId: entry.userId ?? null,
      playerName:
        entry.playerName?.trim() ||
        (entry.userId ? namesByUserId.get(entry.userId) ?? "?" : "?"),
      version: nextVersion,
    })),
  });

  const rankingPayload = sorted.map((entry, index) => ({
    position: index + 1,
    userId: entry.userId ?? null,
    playerName:
      entry.playerName?.trim() ||
      (entry.userId ? namesByUserId.get(entry.userId) ?? "?" : "?"),
  }));

  if (pusher) {
    await pusher.trigger(
      getLobbyChannelName(lobby.code),
      "ranking_proposed",
      {
        version: nextVersion,
        ranking: rankingPayload,
        proposedBy: {
          id: session.user.id,
          name: session.user.name ?? "Usuário",
        },
      }
    );
  }

  return NextResponse.json({ ok: true, version: nextVersion });
}
