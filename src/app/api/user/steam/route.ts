import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { steamUsername } = body;

  if (!steamUsername || typeof steamUsername !== "string" || steamUsername.trim().length === 0) {
    return NextResponse.json(
      { error: "Nome de usuário Steam é obrigatório" },
      { status: 400 }
    );
  }

  const trimmedUsername = steamUsername.trim();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { steamUsername: trimmedUsername },
  });

  const claimedEntries = await prisma.partidaPodium.updateMany({
    where: {
      userId: null,
      playerName: {
        equals: trimmedUsername,
        mode: "insensitive",
      },
    },
    data: {
      userId: session.user.id,
    },
  });

  console.log(
    `Claim: ${claimedEntries.count} entradas vinculadas ao usuário ${session.user.id} (${trimmedUsername})`
  );

  return NextResponse.json({
    success: true,
    claimedCount: claimedEntries.count,
  });
}
