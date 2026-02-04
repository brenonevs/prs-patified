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
  const allPodium = await prisma.partidaPodium.findMany({
    include: {
      user: true,
      partida: { select: { jogo: true } },
    },
  });

  type PlayerData = {
    name: string;
    jogo: string;
    patificadas: number;
    vezesPatificado: number;
    cheatAttempts: number;
    pontos: number;
    isGuest: boolean;
  };

  const byPlayer = new Map<string, PlayerData>();

  for (const p of allPodium) {
    let key: string;
    let name: string;
    let isGuest: boolean;
    let cheatAttempts: number;

    if (p.userId && p.user) {
      key = `user:${p.userId}`;
      name = p.user.steamUsername ?? p.user.name;
      isGuest = false;
      cheatAttempts = p.user.cheatAttempts ?? 0;
    } else if (p.playerName) {
      key = `guest:${p.playerName.toLowerCase().trim()}`;
      name = p.playerName;
      isGuest = true;
      cheatAttempts = 0;
    } else {
      continue; 
    }

    const current = byPlayer.get(key);
    const pontosDaPosicao = getPontosPorPosicao(p.posicao);

    byPlayer.set(key, {
      name: current?.name ?? name,
      jogo: current?.jogo ?? p.partida.jogo,
      patificadas: (current?.patificadas ?? 0) + (p.posicao === 1 ? 1 : 0),
      vezesPatificado: (current?.vezesPatificado ?? 0) + (p.posicao >= 2 ? 1 : 0),
      cheatAttempts: current?.cheatAttempts ?? cheatAttempts,
      pontos: (current?.pontos ?? 0) + pontosDaPosicao,
      isGuest: current?.isGuest ?? isGuest,
    });
  }

  const ranking = Array.from(byPlayer.entries())
    .map(([key, data]) => ({
      userId: key.startsWith("user:") ? key.replace("user:", "") : null,
      name: data.name,
      jogo: data.jogo,
      patificadas: data.patificadas,
      vezesPatificado: data.vezesPatificado,
      cheatAttempts: data.cheatAttempts,
      pontos: data.pontos,
      isGuest: data.isGuest,
    }))
    .sort((a, b) => b.pontos - a.pontos)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return NextResponse.json(ranking);
}
