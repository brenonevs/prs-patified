import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PONTOS_POR_POSICAO: Record<number, number> = {
  1: 5,  
  2: 3,  
  3: 2, 
  4: 1,  
  // 5º+ lugar: 0 pontos
};

function getPontosPorPosicao(posicao: number): number {
  return PONTOS_POR_POSICAO[posicao] ?? 0;
}

export async function GET() {
  const podiumByUser = await prisma.partidaPodium.findMany({
    where: { userId: { not: null } },
    include: {
      user: true,
      partida: { select: { jogo: true } },
    },
  });

  const byUserId = new Map<
    string,
    {
      name: string;
      jogo: string;
      patificadas: number;
      vezesPatificado: number;
      cheatAttempts: number;
      pontos: number;
    }
  >();

  for (const p of podiumByUser) {
    if (!p.userId || !p.user) continue;
    const current = byUserId.get(p.userId);
    const pontosDaPosicao = getPontosPorPosicao(p.posicao);

    byUserId.set(p.userId, {
      name: p.user.steamUsername ?? p.user.name,
      jogo: current?.jogo ?? p.partida.jogo,
      patificadas: (current?.patificadas ?? 0) + (p.posicao === 1 ? 1 : 0),
      vezesPatificado: (current?.vezesPatificado ?? 0) + (p.posicao >= 2 ? 1 : 0),
      cheatAttempts: p.user.cheatAttempts ?? 0,
      pontos: (current?.pontos ?? 0) + pontosDaPosicao,
    });
  }

  const ranking = Array.from(byUserId.entries())
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      jogo: data.jogo,
      patificadas: data.patificadas,
      vezesPatificado: data.vezesPatificado,
      cheatAttempts: data.cheatAttempts,
      pontos: data.pontos,
    }))
    .sort((a, b) => b.pontos - a.pontos)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return NextResponse.json(ranking);
}
