import { join } from "path";
import { runTrellis } from "./replicate";
import {
  getOutputsDir,
  downloadToFile,
  generateOutputModelFilename,
} from "./file-handler";

/**
 * Processa uma imagem e gera um modelo 3D via Replicate (modelo Trellis).
 * Baixa o arquivo do link de entrega na pasta outputs e retorna a URL da API
 * para acesso ao arquivo.
 *
 * @param imagePath - Caminho absoluto da imagem de entrada
 * @returns URL da API para download do modelo 3D (/api/outputs/<filename>)
 */
export async function processImageTo3D(imagePath: string): Promise<string> {
  const modelUrl = await runTrellis(imagePath);
  const filename = generateOutputModelFilename();
  const destPath = join(getOutputsDir(), filename);
  await downloadToFile(modelUrl, destPath);
  return `/api/outputs/${filename}`;
}
