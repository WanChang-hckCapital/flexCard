import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import AuthSessionProvider from "../(auth)/auth-session-provider";
import Favicon from "/public/favicon.ico";
import { Toaster as SonnarToaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/utils/authOptions";
import { fetchMemberImage } from "@/lib/actions/user.actions";
import Header from "@/components/shared/header";
import { fetchMember } from "@/lib/actions/admin.actions";
import Script from "next/script";
import { ThemeProvider } from "../../context/theme-context";
import { DictProvider } from "@/app/context/dictionary-context";
import { getDictionary } from "../dictionaries";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Flex Card",
  description: "Build you own Flex Card...",
  icons: [{ rel: "icon", url: Favicon.src }],
};

export default async function WorkspaceLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);
  // const session = await getServerSession(authOptions);
  // const user = session?.user;

  // let userInfo = null;
  // let userImage = null;
  // if (user) {
  //   userInfo = await fetchMember(user.id);
  //   if (userInfo && typeof userInfo.toObject === "function") {
  //     userInfo = userInfo.toObject();
  //   }

  //   if (userInfo.image) {
  //     userImage = await fetchMemberImage(userInfo.image);
  //     if (userImage && typeof userImage.toObject === "function") {
  //       userImage = userImage.toObject();
  //     }
  //   }
  // }

  return (
    <AuthSessionProvider>
      <ThemeProvider>
        <html lang="en">
          {/* <Script src="/opencv.js" strategy="beforeInteractive" />{" "} */}
          <body
            className={cn(
              "min-h-screen flex flex-col dark:bg-dark-1 justify-center dark:text-white font-sans antialiased",
              fontSans.variable
            )}
          >
            <main className="h-screen overflow-hidden">
              <section className="flex h-full flex-row">
                <div className="z-99" id="modal-root"></div>
                <DictProvider dict={dict}>
                  <div className="w-full">{children}</div>
                </DictProvider>
              </section>
            </main>
            <SonnarToaster position="bottom-left" />
          </body>
        </html>
      </ThemeProvider>
    </AuthSessionProvider>
  );
}
