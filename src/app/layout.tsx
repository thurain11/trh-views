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
    <html lang="en" className="theme-dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.remove('theme-light','theme-dark');document.documentElement.classList.add(t==='light'?'theme-light':'theme-dark');}catch(e){}",
          }}
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
