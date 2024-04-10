import { fabric } from "fabric";
import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"
import '../globals.css'
import { cn } from '@/lib/utils'
import AuthSessionProvider from '../(auth)/auth-session-provider'
import Favicon from '/public/favicon.ico';
import { Toaster } from "@/components/ui/sonner"
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

export default async function WorkspaceLayout({
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

  // const canvasObjects = useStorage((root) => root.canvasObjects);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // const fabricRef = useRef<fabric.Canvas | null>(null);
  // const [elementAttributes, setElementAttributes] = useState<Attributes>({
  //   width: "",
  //   height: "",
  //   fontSize: "",
  //   fontFamily: "",
  //   fontWeight: "",
  //   fill: "#aabbcc",
  //   stroke: "#aabbcc",
  // });

  // const activeObjectRef = useRef<fabric.Object | null>(null);
  // const isEditingRef = useRef(false);
  

  return (
    <AuthSessionProvider>
      <html lang="en">
        <body
          className={cn(
            "min-h-screen flex flex-col bg-dark-1 justify-center text-white font-sans antialiased",
            fontSans.variable
          )}>
            
            <main className='h-screen overflow-hidden'>
              <section className='flex h-full flex-row'>
              {/* <Header session={session} userInfoImage={userImage} /> */}
                {/* <LeftSidebar allShapes={Array.from(canvasObjects)} /> */}
                {/* <LeftSidebar /> */}
                {/* <Live canvasRef={canvasRef} undo={undo} redo={redo} /> */}
                <div className='w-full'>{children}</div>
                {/* <RightSidebar /> */}
                {/* <RightSidebar
                  elementAttributes={elementAttributes}
                  setElementAttributes={setElementAttributes}
                  fabricRef={fabricRef}
                  isEditingRef={isEditingRef}
                  activeObjectRef={activeObjectRef}
                  syncShapeInStorage={syncShapeInStorage}
                /> */}
              </section>
            </main>
          <Toaster />
          {/* <Footer /> */}
        </body>
      </html>
    </AuthSessionProvider>
  )
}
