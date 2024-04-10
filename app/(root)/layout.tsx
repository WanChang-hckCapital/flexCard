import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"
import '../globals.css'
import { cn } from '@/lib/utils'
import AuthSessionProvider from '../(auth)/auth-session-provider'
import Favicon from '/public/favicon.ico';
import { Toaster } from "@/components/ui/sonner"
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import LeftSidebar from '@/components/shared/LeftSidebar'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { fetchMember, fetchMemberImage } from '@/lib/actions/user.actions'

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
  if (!user){
    userInfo = null;
  }else{
    userInfo = await fetchMember(user.id);
    userImage = await fetchMemberImage(userInfo.image);
  }

  

  return (
    <AuthSessionProvider>
      <html lang="en">
        <body
          className={cn(
            "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
            fontSans.variable
          )}>

          <main className='flex flex-row'>
            <Header session={session} userInfoImage={userImage} />
            <LeftSidebar session={session} userInfoImage={userImage}/>
            <section className='main-container'>
              <div className='w-full'>{children}</div>
            </section>
          </main>
          <Toaster />
          {/* <Footer /> */}
        </body>
      </html>
    </AuthSessionProvider>
  )
}
