import { redirect } from 'next/navigation'
import React from 'react'
import CardEditorNavigation from './_components/card-editor-navigation'
import CardEditorSidebar from './_components/card-editor-sidebar'
import CardEditor from './_components/card-editor'
import EditorProvider from '@/lib/editor/editor-provider'
import { fetchCardDetails } from '@/lib/actions/workspace.actions'

type Props = {
  params: { 
    userId: string
    authaccountId: string
    cardId: string
  }
}

const Page = async ({ params }: Props) => {
  const cardDetails = await fetchCardDetails(params.cardId)
  if (!cardDetails)
    return redirect(`/${params.userId}/cards`)

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        authaccountId={params.authaccountId}
        cardId={params.cardId}
        cardDetails={cardDetails}
      >
        <CardEditorNavigation
          cardId={params.cardId}
          cardDetails={cardDetails}
          authaccountId={params.authaccountId}
        />
        {/* <div className="h-full flex justify-center">
          <CardEditor cardPageId={params.cardPageId} />
        </div>

        <CardEditorSidebar authaccountId={params.authaccountId} /> */}
      </EditorProvider>
    </div>
  )
}

export default Page
