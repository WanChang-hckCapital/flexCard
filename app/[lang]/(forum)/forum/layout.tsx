import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../../globals.css";
import { cn } from "@/lib/utils";
import AuthSessionProvider from "@/app/[lang]/(auth)/auth-session-provider";
import Favicon from "/public/favicon.ico";
import { ThemeProvider } from "@/app/context/theme-context";
import { DictProvider } from "@/app/context/dictionary-context";
import { getDictionary } from "../../dictionaries";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Flex Card",
  description: "Build you own Flex Card...",
  icons: [{ rel: "icon", url: Favicon.src }],
};

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);

  return (
    <AuthSessionProvider>
      <ThemeProvider>
        <html lang="en">
          <body
            className={cn(
              "min-h-screen flex flex-col dark:bg-dark-1 bg-stone-100 justify-center text-white font-sans antialiased",
              fontSans.variable
            )}
          >
            <main className="flex flex-row justify-center">
              <section className="w-full justify-center">
                <DictProvider dict={dict}>
                  <div className="w-full">{children}</div>
                </DictProvider>
              </section>
            </main>
          </body>
        </html>
      </ThemeProvider>
    </AuthSessionProvider>
  );
}
