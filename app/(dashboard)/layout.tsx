import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"
import '../globals.css'
import { cn } from '@/lib/utils'
import AuthSessionProvider from '../(auth)/auth-session-provider'
import Favicon from '/public/favicon.ico';
import { Toaster } from "@/components/ui/sonner"
import { Toaster as SonnarToaster } from '@/components/ui/sonner'
import Header from '@/components/admin/header'
import Footer from '@/components/shared/footer'
import LeftSidebar from '@/components/shared/LeftSidebar'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { fetchMemberImage } from '@/lib/actions/user.actions'
import { TooltipProvider } from '@/components/ui/tooltip'
import SideBar from '@/components/admin/sidebar'
import { fetchMember } from '@/lib/actions/admin.actions'

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
export const metadata: Metadata = {
  title: 'Flex Card',
  description: 'Build you own Flex Card...',
  icons: [{ rel: 'icon', url: Favicon.src }],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user;

  let userInfo = null;
  let userImage = null;
  if (user) {
    userInfo = await fetchMember(user.id);
    if (userInfo && typeof userInfo.toObject === 'function') {
      userInfo = userInfo.toObject();
    }

    if (userInfo.image) {
      userImage = await fetchMemberImage(userInfo.image);
      if (userImage && typeof userImage.toObject === 'function') {
        userImage = userImage.toObject();
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
          )}>

          <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <SideBar />
            <div className="flex flex-col">
              <Header session={session} userInfoImage={userImage} />
              <main className='flex flex-row'>
                {/* <Header session={session} userInfoImage={userImage} />
              <LeftSidebar session={session} userInfoImage={userImage}/> */}
                {/* <section className='main-container'>
              
              </section> */}

                <TooltipProvider>
                  <div className='w-full'>{children}</div>
                </TooltipProvider>
              </main>
            </div>
          </div>
          <SonnarToaster position="bottom-left" />
          {/* <Footer /> */}
        </body>
      </html>
    </AuthSessionProvider>
  )
}
