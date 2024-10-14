import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../../globals.css";
import { cn } from "@/lib/utils";
import AuthSessionProvider from "@/app/[lang]/(auth)/auth-session-provider";
import Favicon from "/public/favicon.ico";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Flex Card",
  description: "Build you own Flex Card...",
  icons: [{ rel: "icon", url: Favicon.src }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <html lang="en">
        <body
          className={cn(
            "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
            fontSans.variable
          )}
        >
          <main className="flex flex-row justify-center">
            <section className="w-full justify-center">
              <div className="w-full">{children}</div>
            </section>
          </main>
        </body>
      </html>
    </AuthSessionProvider>
  );
}
