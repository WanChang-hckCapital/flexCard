import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"
import '../globals.css'
import { cn } from '@/lib/utils'
import AuthSessionProvider from '../(auth)/auth-session-provider'
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthSessionProvider>
      <html lang="en">
        <body
          className={cn(
            "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
            fontSans.variable
          )}>


          <main className='flex flex-row justify-center'>
            <section className='justify-center'>
              <div className='w-full max-w-4xl'>{children}</div>
            </section>
          </main>


        </body>
      </html>
    </AuthSessionProvider>
  )
}
