import BrowseItems from '@/components/browse-items'
import MaxWContainer from '@/components/max-w-container'
import Link from 'next/link'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import { updateLastLoginDate } from '@/lib/actions/user.actions'

async function Home() {

  const session = await getServerSession(authOptions)

  if(session){  
    const user = session?.user;
    const updateLoginStatus = await updateLastLoginDate(user.id);
  }

  return (
    <div className="flex flex-col min-h-screen dark:bg-black">
      <MaxWContainer>

        <div className="py-4"></div>
        <h3 className="mb-16 mt-16 text-center text-xl sm:text-4xl px-2 py-8 sm:py-16 bg-primary">
          Why buy when you can rent! Choose from thousand of items available to rent.
        </h3>

        {/* browse the items*/}
        <BrowseItems />

        <div className="py-4"></div>
        <h3 className="mt-16 mb-16 text-center text-xl sm:text-4xl px-2 py-4 sm:py-16 bg-primary">
          Ready to make money? <Link className='font-bold' href='/my-listings'>Start now &rarr;</Link>
        </h3>

      </MaxWContainer>
    </div>
  )
}

export default Home;
