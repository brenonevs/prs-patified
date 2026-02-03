interface ProcessingStatusProps {
  status: string;
  isProcessing: boolean;
  error: string | null;
}

export function ProcessingStatus({
  status,
  isProcessing,
  error,
}: ProcessingStatusProps) {
  if (error) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="mt-4 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
      <div className="flex items-center gap-3">
        {isProcessing && (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        <p className="text-zinc-300 text-sm">{status}</p>
      </div>
    </div>
  );
}
