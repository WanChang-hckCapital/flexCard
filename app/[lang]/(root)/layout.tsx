import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import AuthSessionProvider from "../../(auth)/auth-session-provider";
import Favicon from "/public/favicon.ico";
import { Toaster as SonnarToaster } from "@/components/ui/sonner";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/utils/authOptions";
import { fetchCurrentActiveProfileId, fetchMemberImage } from "@/lib/actions/user.actions";
import { fetchMember, fetchProfile } from "@/lib/actions/admin.actions";
import RightSidebarWrapper from "@/components/shared/RightSideWrapper";
import { ThemeProvider } from "../../context/theme-context";
import { getDictionary } from "../dictionaries";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Flex Card",
  description: "Build you own Flex Card...",
  icons: [{ rel: "icon", url: Favicon.src, sizes: "16x16" }],
};

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const dict = await getDictionary(lang);

  let profileInfo = null;
  let profileImage = null;
  if (user) {

    const authUserId = user.id.toString();
    const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

    profileInfo = await fetchProfile(authActiveProfileId);
    if (profileInfo && typeof profileInfo.toObject === "function") {
      profileInfo = profileInfo.toObject();
    }

    if (profileInfo.image) {
      profileImage = await fetchMemberImage(profileInfo.image);
      if (profileImage && typeof profileImage.toObject === "function") {
        profileImage = profileImage.toObject();
      }
    }
  }

  return (
    <AuthSessionProvider>
      <ThemeProvider>
        <html lang="en">
          <body
            className={cn(
              "min-h-screen flex flex-col dark:bg-dark-1 dark:text-white bg-white text-black justify-center font-sans antialiased",
              fontSans.variable
            )}
          >
            <main className="flex flex-row w-full">
              <Header session={session} userInfoImage={profileImage} dict={dict} />
              <LeftSidebar session={session} userInfoImage={profileImage} dict={dict} />
              <section className="main-container">
                <div id="modal-root"></div>
                <div className="w-full">{children}</div>
              </section>
              {/* <RightSidebarWrapper /> */}
            </main>
            <SonnarToaster position="bottom-left" />
            {/* <Footer /> */}
          </body>
        </html>
      </ThemeProvider>
    </AuthSessionProvider>
  );
}
