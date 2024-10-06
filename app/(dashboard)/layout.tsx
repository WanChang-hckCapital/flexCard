import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import AuthSessionProvider from "../(auth)/auth-session-provider";
import Favicon from "/public/favicon.ico";
import { Toaster as SonnarToaster } from "@/components/ui/sonner";
import Header from "@/components/admin/header";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/utils/authOptions";
import { fetchCurrentActiveProfileId, fetchMemberImage } from "@/lib/actions/user.actions";
import { TooltipProvider } from "@/components/ui/tooltip";
import SideBar from "@/components/admin/sidebar";
import { fetchMember, fetchProfile } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";

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
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) return redirect("/sign-in");

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  let profileInfo = null;
  let userProfileImage = null;
  if (user) {
    profileInfo = await fetchProfile(authActiveProfileId);
    if (profileInfo && typeof profileInfo.toObject === "function") {
      profileInfo = profileInfo.toObject();
    }

    if (profileInfo.image) {
      userProfileImage = await fetchMemberImage(profileInfo.image);
      if (userProfileImage && typeof userProfileImage.toObject === "function") {
        userProfileImage = userProfileImage.toObject();
      }
    }
  }

  return (
    <AuthSessionProvider>
      {/* <ThemeProvider> */}
        <html lang="en">
          <body
            className={cn(
              "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
              fontSans.variable
            )}>
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
              <SideBar usertype={profileInfo.usertype} />
              <div className="flex flex-col">
                <Header
                  session={session}
                  userInfoImage={userProfileImage}
                  usertype={profileInfo.usertype}
                />
                <main className="flex flex-row">
                  <TooltipProvider>
                    <div className="w-full">{children}</div>
                  </TooltipProvider>
                </main>
              </div>
            </div>
            <SonnarToaster position="bottom-left" />
            {/* <Footer /> */}
          </body>
        </html>
      {/* </ThemeProvider> */}
    </AuthSessionProvider>
  );
}
