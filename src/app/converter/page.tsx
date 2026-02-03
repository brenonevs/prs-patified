"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { ModelViewer } from "@/components/ModelViewer";
import { ProcessingStatus } from "@/components/ProcessingStatus";

export default function ConverterPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setModelUrl(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProcessingStatus("Enviando imagem...");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      setProcessingStatus("Processando imagem...");

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao processar imagem");
      }

      const data = await response.json();
      setModelUrl(data.modelUrl);
      setProcessingStatus("Modelo 3D gerado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setProcessingStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setModelUrl(null);
    setProcessingStatus("");
    setError(null);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">PRS Visus</h1>
          <p className="text-gray-400 text-lg">
            Converta imagens de móveis e arquitetura em modelos 3D
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Upload */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Imagem de Entrada</h2>

            {!previewUrl ? (
              <ImageUploader onImageSelect={handleImageSelect} />
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    {isProcessing ? "Processando..." : "Gerar Modelo 3D"}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}

            {(isProcessing || processingStatus || error) && (
              <ProcessingStatus
                status={processingStatus}
                isProcessing={isProcessing}
                error={error}
              />
            )}
          </section>

          {/* Painel de Visualização 3D */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Modelo 3D</h2>
            <ModelViewer modelUrl={modelUrl} />
          </section>
        </div>
      </div>
    </main>
  );
}
