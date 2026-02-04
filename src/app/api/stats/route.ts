import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PONTOS_POR_POSICAO: Record<number, number> = {
  1: 5,
  2: 3,
  3: 2,
  4: 1,
};

function getPontosPorPosicao(posicao: number): number {
  return PONTOS_POR_POSICAO[posicao] ?? 0;
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  const podiumResults = await prisma.partidaPodium.findMany({
    where: { userId },
    include: { partida: { select: { createdAt: true } } },
    orderBy: { partida: { createdAt: "desc" } },
  });

  const vezesPatificou = podiumResults.filter(
    (p: { posicao: number }) => p.posicao === 1
  ).length;
  const vezesPatificado = podiumResults.filter(
    (p: { posicao: number }) => p.posicao >= 2
  ).length;
  const totalPartidas = podiumResults.length;

  let sequenciaAtual = 0;
  for (const p of podiumResults) {
    if (p.posicao === 1) sequenciaAtual++;
    else break;
  }

  const podiumByUser = await prisma.partidaPodium.findMany({
    where: { userId: { not: null } },
    include: {
      user: true,
      partida: { select: { jogo: true } },
    },
  });

  const byUserId = new Map<string, number>();
  for (const p of podiumByUser) {
    if (!p.userId) continue;
    const pts = getPontosPorPosicao(p.posicao);
    byUserId.set(p.userId, (byUserId.get(p.userId) ?? 0) + pts);
  }

  const sorted = Array.from(byUserId.entries())
    .sort(
      (
        [, a]: [string, number],
        [, b]: [string, number]
      ) => b - a
    )
    .map(([uid], index) => ({ userId: uid, rank: index + 1 }));

  const totalRanking = sorted.length;
  const meuRank = sorted.find(
    (r: { userId: string; rank: number }) => r.userId === userId
  )?.rank ?? null;

  return NextResponse.json({
    vezesPatificado,
    vezesPatificou,
    totalPartidas,
    sequenciaAtual,
    rank: meuRank,
    totalRanking,
  });
}
