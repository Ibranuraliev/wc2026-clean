export default function Loading() {
  return (
    <main className="min-h-screen bg-bg text-fg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-pitch border-t-transparent rounded-full animate-spin" />
        <span className="text-muted text-sm">Загрузка...</span>
      </div>
    </main>
  );
}
