import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Favicon from "/public/favicon.ico";
import "../globals.css";
import { Toaster as SonnarToaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flex Card",
  description: "Build you own Flex Card...",
  icons: [{ rel: "icon", url: Favicon.src }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                  (function() {
                    const theme = document.cookie.match(/theme=([^;]+)/)?.[1] || 'light';
                    document.documentElement.classList.add(theme);
                  })();
                `,
          }}
        />
      </head>
      <body>
        <main>
          <section>
            <div className="min-h-screen p-6">{children}</div>
          </section>
        </main>
        <SonnarToaster position="bottom-left" />
      </body>
    </html>
  );
}
