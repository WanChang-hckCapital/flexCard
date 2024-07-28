// import type { Metadata } from "next";
// import { Inter as FontSans } from "next/font/google";
// import "../globals.css";
// import { cn } from "@/lib/utils";
// import AuthSessionProvider from "../(auth)/auth-session-provider";
// import Favicon from "/public/favicon.ico";
// import { Toaster as SonnarToaster } from "@/components/ui/sonner";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../api/auth/[...nextauth]/route";
// import { fetchMemberImage } from "@/lib/actions/user.actions";
// import Header from "@/components/shared/header";
// import { fetchMember } from "@/lib/actions/admin.actions";

// const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

// export const metadata: Metadata = {
//   title: "Flex Card",
//   description: "Build you own Flex Card...",
//   icons: [{ rel: "icon", url: Favicon.src }],
// };

// export default async function WorkspaceLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await getServerSession(authOptions);
//   const user = session?.user;

//   let userInfo = null;
//   let userImage = null;
//   if (user) {
//     userInfo = await fetchMember(user.id);
//     if (userInfo && typeof userInfo.toObject === "function") {
//       userInfo = userInfo.toObject();
//     }

//     if (userInfo.image) {
//       userImage = await fetchMemberImage(userInfo.image);
//       if (userImage && typeof userImage.toObject === "function") {
//         userImage = userImage.toObject();
//       }
//     }
//   }

//   return (
//     <AuthSessionProvider>
//       <html lang="en">
//         <script src="/opencv.js"></script>
//         <body
//           className={cn(
//             "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
//             fontSans.variable
//           )}>
//           <main className="h-screen overflow-hidden">
//             <section className="flex h-full flex-row">
//               {/* <Header session={session} userInfoImage={userImage} /> */}
//               {/* <LeftSidebar /> */}
//               <div className="z-99" id="modal-root"></div>
//               <div className="w-full">{children}</div>
//             </section>
//           </main>
//           <SonnarToaster position="bottom-left" />
//         </body>
//       </html>
//     </AuthSessionProvider>
//   );
// }
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import AuthSessionProvider from "../(auth)/auth-session-provider";
import Favicon from "/public/favicon.ico";
import { Toaster as SonnarToaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/utils/authOptions";
import { fetchMemberImage } from "@/lib/actions/user.actions";
import Header from "@/components/shared/header";
import { fetchMember } from "@/lib/actions/admin.actions";
import Script from "next/script";

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
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let userInfo = null;
  let userImage = null;
  if (user) {
    userInfo = await fetchMember(user.id);
    if (userInfo && typeof userInfo.toObject === "function") {
      userInfo = userInfo.toObject();
    }

    if (userInfo.image) {
      userImage = await fetchMemberImage(userInfo.image);
      if (userImage && typeof userImage.toObject === "function") {
        userImage = userImage.toObject();
      }
    }
  }

  return (
    <AuthSessionProvider>
      <html lang="en">
        <Script src="/opencv.js" strategy="beforeInteractive" />{" "}
        <body
          className={cn(
            "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
            fontSans.variable
          )}>
          <main className="h-screen overflow-hidden">
            <section className="flex h-full flex-row">
              {/* <Header session={session} userInfoImage={userImage} /> */}
              {/* <LeftSidebar /> */}
              <div className="z-99" id="modal-root"></div>
              <div className="w-full">{children}</div>
            </section>
          </main>
          <SonnarToaster position="bottom-left" />
        </body>
      </html>
    </AuthSessionProvider>
  );
}
