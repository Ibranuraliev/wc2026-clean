import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg text-fg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-bold text-6xl mb-2 text-pitch">404</h1>
        <p className="text-muted text-lg mb-6">Страница не найдена</p>
        <Link
          href="/ru"
          className="inline-flex items-center gap-2 bg-pitch hover:bg-accent text-bg font-bold px-6 py-3 rounded-xl transition-colors"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
