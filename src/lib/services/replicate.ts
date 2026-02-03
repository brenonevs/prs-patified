import Replicate from "replicate";
import { readFile } from "fs/promises";

const TRELLIS_MODEL =
  "firtoz/trellis:e8f6c45206993f297372f5436b90350817bd9b4a0d52d2a76df50c1c8afa2b3c";

/**
 * Resposta do modelo Trellis (imagem → 3D).
 */
export interface TrellisOutput {
  model_file: string;
}

/**
 * Parâmetros de entrada aceitos pelo modelo Trellis.
 */
export interface TrellisInput {
  images: string[];
  texture_size?: number;
  mesh_simplify?: number;
  generate_model?: boolean;
  save_gaussian_ply?: boolean;
  ss_sampling_steps?: number;
}

/**
 * Converte um arquivo de imagem em data URI (base64).
 * Replicate aceita data URIs para arquivos menores que 10MB.
 */
async function imagePathToDataUri(imagePath: string): Promise<string> {
  const buffer = await readFile(imagePath);
  const base64 = buffer.toString("base64");
  const ext = imagePath.split(".").pop()?.toLowerCase() ?? "png";
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${base64}`;
}

/**
 * Gera modelo 3D a partir de uma imagem usando o modelo Trellis no Replicate.
 *
 * @param imagePath - Caminho absoluto da imagem de entrada
 * @param options - Parâmetros opcionais do Trellis (texture_size, mesh_simplify, etc.)
 * @returns URL do arquivo do modelo 3D gerado
 * @throws Error se REPLICATE_API_TOKEN não estiver definido ou a predição falhar
 */
export async function runTrellis(
  imagePath: string,
  options: Partial<Omit<TrellisInput, "images">> = {}
): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      "REPLICATE_API_TOKEN não está definido. Configure em .env para usar a conversão via Replicate."
    );
  }

  const replicate = new Replicate({ auth: token });
  const imageDataUri = await imagePathToDataUri(imagePath);

  const input: TrellisInput = {
    images: [imageDataUri],
    texture_size: 2048,
    mesh_simplify: 0.9,
    generate_model: true,
    save_gaussian_ply: true,
    ss_sampling_steps: 38,
    ...options,
  };

  const output = (await replicate.run(TRELLIS_MODEL, {
    input,
  })) as TrellisOutput;

  const modelFile = output?.model_file;
  if (modelFile == null) {
    throw new Error(
      "Replicate retornou resposta sem model_file. Verifique os logs da predição."
    );
  }

  if (typeof modelFile === "string") return modelFile;
  if (typeof (modelFile as { toString?: () => string }).toString === "function") {
    return (modelFile as { toString: () => string }).toString();
  }
  throw new Error("model_file inesperado (não é URL nem FileOutput).");
}
