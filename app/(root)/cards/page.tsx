// import { getFunnels } from '@/lib/queries'
import React from 'react'
// import FunnelsDataTable from './data-table'
import { Plus } from 'lucide-react'
// import { columns } from './columns'
import BlurPage from '@/components/workspace/blur-page'
import { fetchCardsByAccountId } from '@/lib/actions/workspace.actions'

const Cards = async ({ params }: { params: { accountId: string } }) => {
  const cards = await fetchCardsByAccountId(params.accountId)
  if (!cards) return null

  return (
    <BlurPage>
      {/* <FunnelsDataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Create Card
          </>
        }
        modalChildren={
          <FunnelForm authaccoundId={params.accountId}></FunnelForm>
        }
        filterValue="name"
        columns={columns}
        data={cards}
      /> */}
      <div>hi</div>
    </BlurPage>
  )
}

export default Cards
