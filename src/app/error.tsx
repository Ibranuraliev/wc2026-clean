"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Что-то пошло не так</h1>
          <p className="text-gray-400 mb-6">Произошла непредвиденная ошибка.</p>
          <button
            onClick={reset}
            className="bg-[#00B140] hover:bg-[#3DDC84] text-black font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
