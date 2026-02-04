import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { join } from "path";

export const dynamic = "force-dynamic";

const PROVAS_DIR = join(process.cwd(), "uploads", "provas");

async function saveProva(file: File): Promise<string> {
  const { writeFile, mkdir } = await import("fs/promises");
  const { existsSync } = await import("fs");
  if (!existsSync(join(process.cwd(), "uploads"))) {
    await mkdir(join(process.cwd(), "uploads"), { recursive: true });
  }
  if (!existsSync(PROVAS_DIR)) {
    await mkdir(PROVAS_DIR, { recursive: true });
  }
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split(".").pop() || "png";
  const filename = `${timestamp}-${random}.${ext}`;
  const filepath = join(PROVAS_DIR, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));
  return filename;
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

  const formData = await request.formData();
  const jogo = formData.get("jogo") as string | null;
  const podiumJson = formData.get("podium") as string | null;
  const foto = formData.get("foto") as File | null;

  if (!jogo?.trim()) {
    return NextResponse.json(
      { error: "Preencha o jogo." },
      { status: 400 }
    );
  }
  let userIds: string[];
  try {
    const parsed = JSON.parse(podiumJson ?? "[]") as string[];
    if (!Array.isArray(parsed) || parsed.length < 3) {
      return NextResponse.json(
        { error: "Informe pelo menos os 3 primeiros lugares (1º, 2º e 3º)." },
        { status: 400 }
      );
    }
    const unique = [...new Set(parsed)];
    if (unique.length !== parsed.length) {
      return NextResponse.json(
        { error: "Cada jogador só pode aparecer em uma posição." },
        { status: 400 }
      );
    }
    userIds = parsed;
  } catch {
    return NextResponse.json(
      { error: "Dados do pódio inválidos." },
      { status: 400 }
    );
  }
  if (!foto || !foto.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Envie uma imagem como prova da partida." },
      { status: 400 }
    );
  }

  let fotoFilename: string | null = null;
  try {
    fotoFilename = await saveProva(foto);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao salvar a foto." },
      { status: 500 }
    );
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.name ?? "Sem nome"]));

  const partida = await prisma.partida.create({
    data: {
      jogo: jogo.trim(),
      fotoUrl: fotoFilename,
      createdById: session.user.id,
      podium: {
        create: userIds.map((userId, index) => ({
          posicao: index + 1,
          userId,
          playerName: userMap.get(userId) ?? "?",
        })),
      },
    },
    include: { podium: true },
  });

  return NextResponse.json(partida);
}
