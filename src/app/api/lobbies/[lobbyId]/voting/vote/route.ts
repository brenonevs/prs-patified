import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pusher, getLobbyChannelName } from "@/lib/pusher-server";
import {
  isLobbyTempPhotoUrl,
  commitLobbyPhotoToProvas,
} from "@/lib/services/lobby-photo-storage";

export const dynamic = "force-dynamic";

type VoteStatus = "APPROVED" | "REJECTED";

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
      participants: { where: { leftAt: null }, select: { userId: true } },
      proposedRanking: { orderBy: [{ version: "desc" }], take: 1 },
    },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  if (lobby.status !== "VOTING") {
    return NextResponse.json(
      { error: "Votação não está ativa." },
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
  const status = body.status === "REJECTED" ? "REJECTED" : "APPROVED";
  const version =
    typeof body.version === "number"
      ? body.version
      : lobby.proposedRanking[0]?.version ?? 0;

  if (version < 1) {
    return NextResponse.json(
      { error: "Nenhum ranking proposto ainda. Aguarde uma proposta." },
      { status: 400 }
    );
  }

  await prisma.lobbyVote.upsert({
    where: {
      lobbyId_userId_version: {
        lobbyId,
        userId: session.user.id,
        version,
      },
    },
    create: {
      lobbyId,
      userId: session.user.id,
      version,
      status,
      votedAt: new Date(),
    },
    update: {
      status,
      votedAt: new Date(),
    },
  });

  if (pusher) {
    await pusher.trigger(getLobbyChannelName(lobby.code), "vote_cast", {
      userId: session.user.id,
      status,
      version,
    });
  }

  if (status === "REJECTED") {
    return NextResponse.json({ ok: true, status: "REJECTED" });
  }

  const participantIds = lobby.participants.map((p) => p.userId);
  const votesForVersion = await prisma.lobbyVote.findMany({
    where: { lobbyId, version, status: "APPROVED" },
    select: { userId: true },
  });
  const votedUserIds = new Set(votesForVersion.map((v) => v.userId));
  const allApproved = participantIds.every((id) => votedUserIds.has(id));

  if (!allApproved) {
    return NextResponse.json({ ok: true, status: "APPROVED", completed: false });
  }

  const rankingRows = await prisma.lobbyProposedRanking.findMany({
    where: { lobbyId, version },
    orderBy: { position: "asc" },
  });

  let finalFotoUrl: string | null = lobby.fotoUrl;
  if (lobby.fotoUrl && isLobbyTempPhotoUrl(lobby.fotoUrl)) {
    finalFotoUrl = await commitLobbyPhotoToProvas(lobby.fotoUrl);
  }

  const partida = await prisma.partida.create({
    data: {
      jogo: lobby.jogo,
      fotoUrl: finalFotoUrl ?? undefined,
      createdById: lobby.hostId,
      podium: {
        create: rankingRows.map((r) => ({
          posicao: r.position,
          userId: r.userId,
          playerName: r.playerName,
        })),
      },
    },
    include: { podium: true },
  });

  await prisma.lobby.update({
    where: { id: lobbyId },
    data: { status: "COMPLETED", partidaId: partida.id },
  });

  if (pusher) {
    await pusher.trigger(
      getLobbyChannelName(lobby.code),
      "voting_completed",
      { partidaId: partida.id }
    );
  }

  return NextResponse.json({
    ok: true,
    status: "APPROVED",
    completed: true,
    partidaId: partida.id,
  });
}
