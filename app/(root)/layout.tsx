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

  return (
    <AuthSessionProvider>
      <html lang="en">
        <body
          className={cn(
            "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
            fontSans.variable
          )}>

          
          <main className='flex flex-row'>
            <Header />
            <LeftSidebar session={session}/>
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
