import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALIDATION_API_URL = "https://prs-patified-575184900812.southamerica-east1.run.app";

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, 
          matrix[i][j - 1] + 1,     
          matrix[i - 1][j] + 1      
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function stringSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower === bLower) return 1;

  const maxLen = Math.max(aLower.length, bLower.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(aLower, bLower);
  return 1 - distance / maxLen;
}

function findBestMatch(
  detectedName: string,
  registeredUsers: { id: string; steamUsername: string | null }[]
): { id: string; name: string; similarity: number } | null {
  let bestMatch: { id: string; name: string; similarity: number } | null = null;

  for (const user of registeredUsers) {
    if (!user.steamUsername) continue;

    const similarity = stringSimilarity(detectedName, user.steamUsername);

    if (!bestMatch || similarity > bestMatch.similarity) {
      bestMatch = {
        id: user.id,
        name: user.steamUsername,
        similarity,
      };
    }
  }

  if (bestMatch && bestMatch.similarity >= 0.5) {
    return bestMatch;
  }

  return null;
}

type ValidationResponse = {
  rankingCorreto: boolean;
  rankingCorrigido: string[];
};

async function validateRanking(
  playerNames: string[],
  imageUrl: string
): Promise<ValidationResponse> {
  const prompt = `Analise a imagem e compare com o ranking enviado no prompt abaixo.

RANKING ENVIADO NO PROMPT (para validação):
${JSON.stringify(playerNames)}

Tarefa:
1. Identifique na imagem qual é o ranking exato (ordem de colocação: 1º, 2º, 3º, etc.).
2. Compare com o "RANKING ENVIADO" acima.
3. Responda em JSON com exatamente os campos definidos no schema:
   - rankingCorreto: true se o ranking da imagem é idêntico ao enviado (mesma ordem); false se houver qualquer diferença.
   - rankingCorrigido: só preencha quando rankingCorreto for false. Array de strings na ordem correta conforme a imagem (índice 0 = 1º lugar). Quando rankingCorreto for true, use array vazio [].`;

  const response = await fetch(VALIDATION_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, imageUrl }),
  });

  if (!response.ok) {
    throw new Error("Erro ao validar ranking");
  }

  return response.json();
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const partidas = await prisma.partida.findMany({
    where: {
      podium: {
        some: { userId: session.user.id },
      },
    },
    include: {
      podium: { orderBy: { posicao: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = partidas.flatMap((p) => {
    const myPodium = p.podium.find((pd) => pd.userId === session.user!.id);
    if (!myPodium) return [];
    const tipo = myPodium.posicao === 1 ? "Patifiquei" : "Fui patificado";
    return [
      {
        id: `${p.id}-${myPodium.posicao}`,
        data: p.createdAt.toISOString().slice(0, 10),
        tipo,
        resultado: "Vitória",
      },
    ];
  });

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { jogo, podium: userIds, imageUrl } = body as {
    jogo?: string;
    podium?: string[];
    imageUrl?: string;
  };

  if (!jogo?.trim()) {
    return NextResponse.json(
      { error: "Preencha o jogo." },
      { status: 400 }
    );
  }

  if (!Array.isArray(userIds) || userIds.length < 1) {
    return NextResponse.json(
      { error: "Informe pelo menos 1 jogador." },
      { status: 400 }
    );
  }

  const unique = [...new Set(userIds)];
  if (unique.length !== userIds.length) {
    return NextResponse.json(
      { error: "Cada jogador só pode aparecer em uma posição." },
      { status: 400 }
    );
  }

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Envie uma imagem como prova da partida." },
      { status: 400 }
    );
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, steamUsername: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.steamUsername ?? "?"]));

  const playerNames = userIds.map((id) => userMap.get(id) ?? "?");

  let cheatingDetected = false;
  let finalUserIds = userIds;
  let finalPlayerNames = playerNames;
  let originalRanking = playerNames;
  let correctedRanking: string[] | null = null;
  const isRemoteUrl = imageUrl.startsWith("http://") || imageUrl.startsWith("https://");

  if (isRemoteUrl) {
    try {
      const validation = await validateRanking(playerNames, imageUrl);
      console.log("Resultado da validação:", JSON.stringify(validation, null, 2));

      if (!validation.rankingCorreto) {
        cheatingDetected = true;

        await prisma.user.update({
          where: { id: session.user.id },
          data: { cheatAttempts: { increment: 1 } },
        });

        if (validation.rankingCorrigido && validation.rankingCorrigido.length > 0) {
          correctedRanking = validation.rankingCorrigido;

          const allUsers = await prisma.user.findMany({
            where: { steamUsername: { not: null } },
            select: { id: true, steamUsername: true },
          });

          console.log("Usuários disponíveis:", allUsers.map(u => u.steamUsername));
          console.log("Nomes detectados pela IA:", validation.rankingCorrigido);

          const matchedResults = validation.rankingCorrigido.map((detectedName) => {
            const match = findBestMatch(detectedName, allUsers);
            console.log(`"${detectedName}" -> ${match ? `"${match.name}" (${(match.similarity * 100).toFixed(0)}%)` : "sem match"}`);
            return match;
          });

          const correctedIds = matchedResults
            .filter((m): m is NonNullable<typeof m> => m !== null)
            .map((m) => m.id);

          const correctedNames = matchedResults
            .filter((m): m is NonNullable<typeof m> => m !== null)
            .map((m) => m.name);

          console.log("IDs mapeados:", correctedIds);

          if (correctedIds.length >= 1) {
            finalUserIds = correctedIds;
            finalPlayerNames = correctedNames;
          }
        }
      }
    } catch (err) {
      console.error("Erro na validação:", err);
    }
  }

  const partida = await prisma.partida.create({
    data: {
      jogo: jogo.trim(),
      fotoUrl: imageUrl,
      createdById: session.user.id,
      podium: {
        create: finalUserIds.map((userId, index) => ({
          posicao: index + 1,
          userId,
          playerName: finalPlayerNames[index] ?? userMap.get(userId) ?? "?",
        })),
      },
    },
    include: { podium: true },
  });

  return NextResponse.json({
    ...partida,
    cheatingDetected,
    ...(cheatingDetected && {
      originalRanking,
      correctedRanking,
    }),
  });
}
