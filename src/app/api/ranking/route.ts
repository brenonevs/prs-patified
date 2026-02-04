import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PONTOS_POR_PATIFICADA = 3;
const PONTOS_POR_VEZ_PATIFICADO = -1;

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
    { name: string; jogo: string; patificadas: number; vezesPatificado: number; cheatAttempts: number }
  >();

  for (const p of podiumByUser) {
    if (!p.userId || !p.user) continue;
    const current = byUserId.get(p.userId);
    const patificadas = (current?.patificadas ?? 0) + (p.posicao === 1 ? 1 : 0);
    const vezesPatificado = (current?.vezesPatificado ?? 0) + (p.posicao >= 2 ? 1 : 0);
    byUserId.set(p.userId, {
      name: p.user.steamUsername ?? p.user.name,
      jogo: current?.jogo ?? p.partida.jogo,
      patificadas,
      vezesPatificado,
      cheatAttempts: p.user.cheatAttempts ?? 0,
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
      pontos:
        PONTOS_POR_PATIFICADA * data.patificadas +
        PONTOS_POR_VEZ_PATIFICADO * data.vezesPatificado,
    }))
    .sort((a, b) => b.pontos - a.pontos)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return NextResponse.json(ranking);
}
