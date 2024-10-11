import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
// import AuthSessionProvider from "../(auth)/auth-session-provider";
import AuthSessionProvider from "@/app/(auth)/auth-session-provider";
import Favicon from "/public/favicon.ico";
import { Toaster as SonnarToaster } from "@/components/ui/sonner";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { getServerSession } from "next-auth";
// import { authOptions } from "../api/utils/authOptions";
import { authOptions } from "@/app/api/utils/authOptions";
import {
  fetchCurrentActiveProfileId,
  fetchMemberImage,
} from "@/lib/actions/user.actions";
import { fetchMember, fetchProfile } from "@/lib/actions/admin.actions";
import RightSidebarWrapper from "@/components/shared/RightSideWrapper";

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
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

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
      <html lang="en">
        <body
          className={cn(
            "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
            fontSans.variable
          )}
        >
          <main className="flex flex-row w-full">
            <Header session={session} userInfoImage={profileImage} />
            <LeftSidebar session={session} userInfoImage={profileImage} />
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
    </AuthSessionProvider>
  );
}
