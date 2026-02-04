import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateLobbyCode,
  getLobbyExpiresAt,
  normalizeLobbyCode,
} from "@/lib/lobby-utils";

export const dynamic = "force-dynamic";

const lobbyInclude = {
  host: { select: { id: true, name: true, image: true, steamUsername: true } },
  participants: {
    where: { leftAt: null },
    include: {
      user: {
        select: { id: true, name: true, image: true, steamUsername: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  },
  proposedRanking: {
    include: { proposedBy: { select: { id: true, name: true } } },
  },
  votes: true,
} as const;

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const codeParam = searchParams.get("code");

  if (codeParam) {
    const code = normalizeLobbyCode(codeParam);
    const lobby = await prisma.lobby.findUnique({
      where: { code },
      include: lobbyInclude,
    });
    if (!lobby) {
      return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
    }
    const isParticipant = lobby.participants.some(
      (p) => p.userId === session.user.id
    );
    if (!isParticipant && !["COMPLETED", "CANCELLED", "EXPIRED"].includes(lobby.status)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    return NextResponse.json({
      ...lobby,
      currentUserId: session.user.id,
    });
  }

  const lobbies = await prisma.lobby.findMany({
    where: {
      status: { in: ["WAITING", "IN_PROGRESS", "VOTING"] },
      participants: {
        some: {
          userId: session.user.id,
          leftAt: null,
        },
      },
    },
    include: lobbyInclude,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(lobbies);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const jogo = typeof body.jogo === "string" ? body.jogo.trim() : "";

  if (!jogo) {
    return NextResponse.json(
      { error: "Informe o jogo." },
      { status: 400 }
    );
  }

  let code = generateLobbyCode();
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const existing = await prisma.lobby.findUnique({ where: { code } });
    if (!existing) break;
    code = generateLobbyCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    return NextResponse.json(
      { error: "Não foi possível gerar código único. Tente novamente." },
      { status: 500 }
    );
  }

  const expiresAt = getLobbyExpiresAt();

  const lobby = await prisma.lobby.create({
    data: {
      code,
      jogo,
      hostId: session.user.id,
      expiresAt,
      participants: {
        create: {
          userId: session.user.id,
          isReady: false,
        },
      },
    },
    include: lobbyInclude,
  });

  return NextResponse.json(lobby);
}
