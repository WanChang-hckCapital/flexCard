
import React from 'react'
import BlurPage from '@/components/workspace/blur-page'
import { fetchCardsByAccountId } from '@/lib/actions/workspace.actions'

const Cards = async ({ params }: { params: { accountId: string } }) => {
  const cards = await fetchCardsByAccountId(params.accountId)
  if (!cards) return null

  return (
    <BlurPage>
      <div>hi</div>
    </BlurPage>
  )
}

export default Cards
