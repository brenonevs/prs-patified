import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "uploads");

/**
 * Serve arquivos de modelo 3D gerados.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Previne path traversal
    if (filename.includes("..") || filename.includes("/")) {
      return NextResponse.json(
        { error: "Nome de arquivo inválido" },
        { status: 400 }
      );
    }

    const filepath = join(UPLOADS_DIR, filename);

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filepath);

    const contentType = filename.endsWith(".glb")
      ? "model/gltf-binary"
      : filename.endsWith(".gltf")
        ? "model/gltf+json"
        : "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao servir modelo:", error);
    return NextResponse.json(
      { error: "Erro ao carregar arquivo" },
      { status: 500 }
    );
  }
}
