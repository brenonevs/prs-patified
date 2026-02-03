import { NextRequest, NextResponse } from "next/server";
import { processImageTo3D } from "@/lib/services/image-processor";
import { saveUploadedFile } from "@/lib/services/file-handler";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "Nenhuma imagem fornecida" },
        { status: 400 }
      );
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "O arquivo deve ser uma imagem" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; 
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 10MB" },
        { status: 400 }
      );
    }

    const savedImagePath = await saveUploadedFile(imageFile);
    const modelUrl = await processImageTo3D(savedImagePath);

    return NextResponse.json({
      success: true,
      modelUrl,
      message: "Modelo 3D gerado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
