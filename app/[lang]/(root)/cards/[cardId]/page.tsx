import React from "react";
import {
  fetchCardDetails,
  fetchSuggestedCards,
} from "@/lib/actions/workspace.actions";
import {
  fetchCurrentActiveProfileId,
  getIPCountryInfo,
  updateCardViewData,
} from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { ArrowLeftCircle } from "lucide-react";
import CardComponent from "@/components/card-details/card-component";
import CardInfo from "@/components/card-details/card-info";
import ResponsiveGrid from "@/components/responsive-grid";
import Link from "next/link";
import { getDictionary } from "@/app/[lang]/dictionaries";

type Props = {
  params: { cardId: string, lang: string };
};

const CardDetails = async ({ params }: Props) => {
  const cardDetails = await fetchCardDetails(params.cardId);

  const shareUrl = process.env.NEXT_PUBLIC_BASE_URL + `/cards/${params.cardId}`;

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (user) {
    const authUserId = user?.id.toString();
    const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

    await updateCardViewData({
      authActiveProfileId: authActiveProfileId,
      cardId: params.cardId,
    });
  } else {
    const geoInfo = await getIPCountryInfo();
    await updateCardViewData({
      authActiveProfileId: geoInfo.ip,
      cardId: params.cardId,
    });
  }

  const suggestedCards = await fetchSuggestedCards(params.cardId);

  const lineComponentsContent = JSON.parse(cardDetails.lineComponents.content);
  const bubbleSize = lineComponentsContent.size;

  const dict = await getDictionary(params.lang);

  return (
    <>
      {cardDetails ? (
        <div className="p-3 md:p-12 rounded-2xl md:px-24 lg:px-36">
          <Link href={`/`}>
            <ArrowLeftCircle
              width={30}
              height={30}
              className="ml-[-50px] cursor-pointer"
            />
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 shadow-lg rounded-2xl p-3 md:p-7 lg:p-12 xl:p-16">
            <CardComponent
              flexHtml={cardDetails.flexHtml.content}
              bubbleSize={bubbleSize}
            />
            <CardInfo
              cardTitle={cardDetails.title}
              cardDescription={cardDetails.description}
              creatorImage={cardDetails.creator.image}
              creatorId={cardDetails.creatorID}
              creatorInfo={cardDetails.creator}
              userFollowers={cardDetails.followers.length}
              session={session}
              cardId={cardDetails.cardID}
              likes={cardDetails.likes}
              lineComponents={cardDetails.lineComponents.content}
              shareUrl={shareUrl}
              dict={dict}
            />
          </div>
        </div>
      ) : null}
      {suggestedCards && suggestedCards.length > 0 ? (
        <div className="w-[95%] m-auto">
          <h2 className="mt-8 mb-[8px] ml-[5px] text-2xl font-bold">
            {dict.cardDetails.suggestedCard}
          </h2>
          <ResponsiveGrid result={suggestedCards} />
        </div>
      ) : null}
    </>
  );
};

export default CardDetails;
