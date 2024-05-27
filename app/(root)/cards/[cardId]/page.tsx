import { redirect } from 'next/navigation'
import React from 'react'
import { fetchCardDetails } from '@/lib/actions/workspace.actions'
import { getIPCountryInfo, updateCardViewData } from '@/lib/actions/user.actions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ArrowLeft } from 'lucide-react'

type Props = {
  params: { cardId: string }
}

const CardDetails = async ({ params }: Props) => {
  const cardDetails = await fetchCardDetails(params.cardId)
  if (!cardDetails)
    return redirect(`/profile/${cardDetails.creator}`)

  const session = await getServerSession(authOptions);

  if (session) {
    const user = session?.user;
    await updateCardViewData({ userId: user.id, cardId: params.cardId });
  } else {
    const geoInfo = await getIPCountryInfo();
    await updateCardViewData({ userId: geoInfo.ip, cardId: params.cardId });
  }

  return (
    <>
      {cardDetails ?
        <div className=' bg-white p-3 md:p-12 rounded-2xl md:px-24 lg:px-36'>
          <ArrowLeft className='text-[60px] font-bold ml-[-50px] 
       cursor-pointer hover:bg-gray-200 rounded-full p-2 '
            // onClick={() => router.back()} 
            />
          <div className='grid grid-cols-1 lg:grid-cols-2 md:gap-10 shadow-lg
      rounded-2xl p-3 md:p-7 lg:p-12 xl:pd-16 '
          >

            {/* <PinImage pinDetail={pinDetail} />
            <div className="">
              <PinInfo pinDetail={pinDetail} />
            </div> */}
          </div>
        </div> : null}
    </>
  )
}

export default CardDetails
