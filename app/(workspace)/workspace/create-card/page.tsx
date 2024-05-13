import { redirect } from 'next/navigation'
import React from 'react'
import CardEditorNavigation from './_components/card-editor-navigation'
import CardEditorSidebar from './_components/card-editor-sidebar'
import CardEditor from './_components/card-editor'
import EditorProvider from '@/lib/editor/editor-provider'
import { fetchCardDetails } from '@/lib/actions/workspace.actions'
import { Card } from '@/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

type Props = {
  params: { 
    userId: string
    authaccountId: string
  }
}

const Page = async ({ params }: Props) => {

  const session = await getServerSession(authOptions)
  const user = session?.user;

  if (!user) return null;

  const authaccountId = user.id;

  const newCardData: Card = {
    cardID: "",
    creator: authaccountId,
    title: "Temp Card",
    status: "Developing",
    description: "",
    likes: [],
    followers: [],
    categories: [],
    components: [],
    lineFormatComponent: [],
    updatedAt: new Date,
    createdAt: new Date,
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        authaccountId={authaccountId}
        cardId={newCardData.cardID}
        cardDetails={newCardData}
      >
        <CardEditorNavigation
          cardDetails={newCardData}
          authaccountId={authaccountId}
        />
        <div 
          style={{backgroundImage: "url('../paper-dark.svg')"}}
          className="h-full flex justify-center">
          <CardEditor />
        </div>

        <CardEditorSidebar authaccountId={authaccountId} />
      </EditorProvider>
    </div>
  )
}

export default Page
