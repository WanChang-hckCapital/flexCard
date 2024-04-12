import BlurPage from '@/components/workspace/blur-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import FunnelSettings from './_components/funnel-settings'
import FunnelSteps from './_components/funnel-steps'
import { fetchCardDetails } from '@/lib/actions/workspace.actions'

type Props = {
  params: { cardId: string; userId: string, authaccountId: string }
}

const CardPage = async ({ params }: Props) => {
  const cardDetails = await fetchCardDetails(params.cardId)
  if (!cardDetails)
    return redirect(`/${params.userId}/cards`)

  return (
    <BlurPage>
      <Link
        href={`/${params.userId}/cards`}
        className="flex justify-between gap-4 mb-4 text-muted-foreground"
      >
        Back
      </Link>
      <h1 className="text-3xl mb-8">{cardDetails.name}</h1>
      {/* <Tabs
        defaultValue="steps"
        className="w-full"
      >
        <TabsList className="grid  grid-cols-2 w-[50%] bg-transparent ">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <FunnelSteps
            funnel={cardPages}
            authaccountId={params.authuserId}
            pages={cardPages.FunnelPages}
            cardId={params.cardId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <FunnelSettings
            authaccountId={params.authuserId}
            defaultData={funnelPages}
          />
        </TabsContent>
      </Tabs> */}
    </BlurPage>
  )
}

export default CardPage
