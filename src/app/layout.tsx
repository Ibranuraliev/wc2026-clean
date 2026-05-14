import "./globals.css";

// Root layout — wraps everything with <html> and <body>.
// The [locale]/layout.tsx adds fonts, theme, and intl provider.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
