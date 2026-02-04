import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

const PROVAS_DIR = join(process.cwd(), "uploads", "provas");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename || filename.includes("..")) {
    return NextResponse.json({ error: "Nome de arquivo inválido" }, { status: 400 });
  }

  const filepath = join(PROVAS_DIR, filename);
  if (!existsSync(filepath)) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  const buffer = await readFile(filepath);
  const ext = filename.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "png"
      ? "image/png"
      : ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "webp"
          ? "image/webp"
          : "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
