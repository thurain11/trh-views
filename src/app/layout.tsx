import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Data Pulse Dashboard",
  description: "Responsive dashboard powered by public data sources.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <div className="min-h-screen px-6 pb-16 pt-10 sm:px-10">
          {children}
        </div>
      </body>
    </html>
  );
}
