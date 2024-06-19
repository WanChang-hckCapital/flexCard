import { redirect } from "next/navigation";
import Card from "./Card";
import { fetchPersonalCards } from "@/lib/actions/user.actions";
import ResponsiveGrid from "../responsive-grid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    // image: any;
  }[];
  // components: {
  //   content: string;
  // };
  lineComponents: {
    content: string;
  };
  flexHtml: {
    content: string;
  };
}[];

interface Props {
  authenticatedUserId?: string;
  accountId: string;
  userType: string;
}

async function CardsTab({ authenticatedUserId, accountId, userType }: Props) {
  let result: Result | undefined;

  // if (userType === "ORGANIZATION") {
  //   // result = await fetchCommunityPosts(accountId);
  // } else {
  // result = await fetchPersonalCards(accountId);

  // console.log("return: " + result);
  // }

  // if (process.env.NODE_ENV === "development") {
  //   result = {
  //     id: "",
  //     cards: sampleData
  //       .filter(data => data.cards.some(card => card.creator.id === accountId))
  //       .flatMap(data => data.cards)
  //   };
  // } else {
  result = await fetchPersonalCards(accountId);
  const session = await getServerSession(authOptions)

  if (session) {
    const user = session?.user;
  }
  // }

  if (!result) {
    redirect("/");
  }

  const styles: React.CSSProperties = {
    textAlign: "-webkit-center" as "center",
  };
  

  return (
    // <section className='mt-9 grid auto-rows-auto max-sm:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-xl:grid-cols-6 2xl:grid-cols-7 gap-2'>
    <div style={styles}>
      {/* <section className='mt-7
        columns-2 md:columns-3
        lg:columns-4 mb-4
        xl:columns-5 space-y-2 w-[85%]'>
        {result.map((card) => (
          <div
            key={card.cardId}
            className="break-inside-avoid w-[280px] dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-200 hover:scale-105"
          >
            <div className="w-full max-w-full overflow-hidden">
              <Card
                key={card.cardId}
                id={card.cardId}
                authenticatedUserId={authenticatedUserId}
                title={card.title}
                creator={card.creator}
                likes={card.likes}
                // followers={[{accountname: card.followers.accountname, image: card.creator.image}]}
                followers={[]}
                lineComponents={card.lineComponents.content}
                flexHtml={card.flexHtml.content}
              />
            </div>
          </div>
        ))}
      </section> */}
      <section className='lg:mt-7 space-y-2 mx-auto'>
        <ResponsiveGrid result={result} session={session} />
      </section>

    </div>

  );
}

export default CardsTab;