import BrowseItems from '@/components/browse-items'
import MaxWContainer from '@/components/max-w-container'
import Link from 'next/link'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import { fetchAllCards, getIPCountryInfo, updateLastLoginDateAndIP } from '@/lib/actions/user.actions'
import Card from '@/components/shared/Card'
import { Button } from '@/components/ui/button'

type Result = {
  cardId: string;
  title: string;
  creator: {
    accountname: string;
    image: string;
  };
  likes: {
    accountname: string;
    binarycode: string;
  }[];
  followers: {
    accountname: string;
  }[];
  lineComponents: {
    content: string;
  };
  flexHtml: {
    content: string;
  };
}[];

async function Home() {
  let result: Result | undefined;

  result = await fetchAllCards();

  if (!result) {
    return (
      <div className="flex flex-col min-h-screen dark:bg-black">
        <MaxWContainer>
          <h1>Be the first user to use our component.</h1>
          <Button>
            <Link href='/workspace/create-card'>Try for free!</Link>
          </Button>
        </MaxWContainer>
      </div>
    )
  }

  const session = await getServerSession(authOptions)

  if (session) {
    const user = session?.user;
    const geoInfo = await getIPCountryInfo();
    await updateLastLoginDateAndIP(user.id, geoInfo.ip);
  }

  return (
    <div className="flex flex-col min-h-screen dark:bg-black">
      <section className='mt-7
        columns-2 md:columns-3
        lg:columns-4 mb-4
        xl:columns-6 space-y-2 mx-auto'>
        {result.map((card) => (
          <div
            key={card.cardId}
            className="break-inside-avoid w-[260px] dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-200 hover:scale-105"
          >
            <div className="w-full max-w-full overflow-hidden">
              <Card
                id={card.cardId}
                authenticatedUserId={session?.user.id.toString() || undefined}
                title={card.title}
                creator={card.creator}
                likes={card.likes}
                followers={[]}
                lineComponents={card.lineComponents.content}
                flexHtml={card.flexHtml.content}
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
  

}

export default Home;
