import { redirect } from "next/navigation";
import Card from "./Card";
import { fetchPersonalCards } from "@/lib/actions/user.actions";
import ResponsiveGrid from "../responsive-grid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";

type Result = {
  cardId: string;
  title: string;
  creator: {
    accountname: string;
    image: string;
  };
  likes: {
    userId: string;
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
  const session = await getServerSession(authOptions);

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
    <div style={styles}>
      <section className="lg:mt-7 space-y-2 mx-auto">
        <ResponsiveGrid result={result} session={session} />
      </section>
    </div>
  );
}

export default CardsTab;
