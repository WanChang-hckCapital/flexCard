import { redirect } from "next/navigation";
import Card from "./Card";
import { fetchPersonalCards } from "@/lib/actions/user.actions";
import sampleData from "@/lib/sampleData";

// import { fetchCommunityPosts } from "@/lib/actions/community.actions";
// import { fetchUserPosts } from "@/lib/actions/user.actions";

interface Result {
  id: string;
  cards: {
    _id: string;
    title: string;
    status: string;
    creator: {
      id: string;
      accountname: string;
      image: string;
    };
    likes: {
      id: string;
      image: string;
      name: string;
    }[];
    components: string;
    createdAt: string;
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  userType: string;
}

async function CardsTab({ currentUserId, accountId, userType }: Props) {
  let result: Result | undefined;

  // if (userType === "ORGANIZATION") {
  //   // result = await fetchCommunityPosts(accountId);
  // } else {
    // result = await fetchPersonalCards(accountId);

    // console.log("return: " + result);
  // }

  if (process.env.NODE_ENV === "development") {
    result = {
      id: "",
      cards: sampleData
        .filter(data => data.cards.some(card => card.creator.id === accountId))
        .flatMap(data => data.cards)
    };
  } else {
    result = await fetchPersonalCards(accountId);
  }

  if (!result) {
    redirect("/");
  } 

  return (
    <section className='mt-9 grid auto-rows-auto max-sm:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7 gap-2'>
      {result.cards.map((card) => (
        <Card
          key={card._id}
          id={card._id}
          currentUserId={currentUserId}
          title={card.title}
          creator={
            userType === "PERSONAL"
            ? { username: card.creator.accountname, image: card.creator.image, id: card.creator.id }
            : {
              username: card.creator.accountname,
              image: card.creator.image,
              id: card.creator.id,
            }}
          createdAt={card.createdAt}
          likes={card.likes}
          status={card.status}
          components={card.components}
        />
      ))}
    </section>
  );
}

export default CardsTab;