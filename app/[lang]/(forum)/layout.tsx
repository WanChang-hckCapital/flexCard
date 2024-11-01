import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Favicon from "/public/favicon.ico";
import AuthSessionProvider from "../(auth)/auth-session-provider";
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
    <AuthSessionProvider>
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
              <div>{children}</div>
            </section>
          </main>
          <SonnarToaster position="bottom-left" />
        </body>
      </html>
    </AuthSessionProvider>
  );
}
