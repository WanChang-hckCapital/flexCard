import { redirect } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import CardEditorNavigation from './_components/card-editor-navigation'
import CardEditorSidebar from './_components/card-editor-sidebar'
import CardEditor from './_components/card-editor'
import EditorProvider from '@/lib/editor/editor-provider'
import { fetchCardDetails } from '@/lib/actions/workspace.actions'
import { Card } from '@/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { toast } from 'sonner'

type Props = {
  params: {
    cardId: string
  }
}

const Page = async ({ params }: Props) => {

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) return;

  const authaccountId = user.id;

  const cardDetails = await fetchCardDetails(params.cardId);
  cardDetails.status = "Modifying";

  if (!cardDetails) {
    toast.error('Card not found');
    redirect(`/`);
  }

  if (!cardDetails) return null;
  if (cardDetails.creator !== authaccountId) {
    toast.error('You are not authorized to edit this card');
    redirect(`/`);
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        authaccountId={authaccountId}
        cardId={cardDetails.cardID}
        cardDetails={cardDetails}
      >
        <CardEditorNavigation
          cardDetails={cardDetails}
          authaccountId={authaccountId}
        />
        <div
          style={{ backgroundImage: "url('../paper-dark.svg')" }}
          className="h-full flex justify-center">
          <CardEditor
            componentId={cardDetails.components}
          />
        </div>

        <CardEditorSidebar authaccountId={authaccountId} />
      </EditorProvider>
    </div>
  )
}

export default Page
