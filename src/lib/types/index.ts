/**
 * Resposta da API de conversão de imagem para 3D.
 */
export interface ConvertResponse {
  success: boolean;
  modelUrl: string;
  message: string;
}

/**
 * Resposta de erro da API.
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Status do processamento de imagem.
 */
export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

/**
 * Formatos de modelo 3D suportados.
 */
export type ModelFormat = "glb" | "gltf" | "obj" | "fbx";

/**
 * Configurações de processamento de imagem.
 */
export interface ProcessingOptions {
  format?: ModelFormat;
  quality?: "low" | "medium" | "high";
  generateTextures?: boolean;
}

/**
 * Resposta do modelo Trellis (Replicate) para conversão imagem → 3D.
 */
export interface TrellisOutput {
  model_file: string;
}
