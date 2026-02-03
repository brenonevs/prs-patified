"use client";

interface ModelViewerProps {
  modelUrl: string | null;
}

export function ModelViewer({ modelUrl }: ModelViewerProps) {
  if (!modelUrl) {
    return (
      <div className="aspect-square rounded-xl bg-zinc-800/50 border border-zinc-700 flex flex-col items-center justify-center">
        <svg
          className="w-16 h-16 text-zinc-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="text-zinc-500 text-center px-4">
          O modelo 3D aparecerá aqui após o processamento
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden">
      {/* 
        Placeholder para visualizador 3D.
        Futuramente será integrado com Three.js ou React Three Fiber
        para renderizar os modelos .glb/.gltf gerados.
      */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        <svg
          className="w-16 h-16 text-green-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-zinc-300 mb-4">Modelo gerado!</p>
        <a
          href={modelUrl}
          download
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Download do Modelo 3D
        </a>
      </div>
    </div>
  );
}
