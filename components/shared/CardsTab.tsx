import { redirect } from "next/navigation";
import Card from "./Card";
import { fetchPersonalCards } from "@/lib/actions/user.actions";

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
  components: {
    content: string;
  };
  lineComponents: {
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
  // }

  if (!result) {
    redirect("/");
  }

  return (
    // <section className='mt-9 grid auto-rows-auto max-sm:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-xl:grid-cols-6 2xl:grid-cols-7 gap-2'>
    <section className='mt-7 px-2 md:px-5
      columns-2 md:columns-3
      lg:columns-4 mb-4
      xl:columns-5 space-y-6 mx-auto'>
      {result.map((card) => (
        <Card
          key={card.cardId}
          id={card.cardId}
          authenticatedUserId={authenticatedUserId}
          title={card.title}
          creator={card.creator}
          likes={card.likes}
          // followers={[{accountname: card.followers.accountname, image: card.creator.image}]}
          followers={[]}
          components={card.components.content}
          lineComponents={card.lineComponents.content}
        />
      ))}
    </section>
  );
}

export default CardsTab;