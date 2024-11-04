import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import CardEditorNavigation from "./_components/card-editor-navigation";
import CardEditorSidebar from "./_components/card-editor-sidebar";
import CardEditor from "./_components/card-editor";
import EditorProvider from "@/lib/editor/editor-provider";
import { fetchCardDetails } from "@/lib/actions/workspace.actions";
import { Card } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import CardEditorRightSidebar from "./_components/card-editor-right-sidebar";

type Props = {
  params: {
    cardId: string;
  };
};

const Page = async ({ params }: Props) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  let cardDetails;
  try {
    cardDetails = await fetchCardDetails(params.cardId);
    console.log("cardDetails: ", cardDetails);
  } catch (error) {
    console.error("Error fetching card details: ", error);
    redirect("/");
  }

  if (
    !cardDetails ||
    cardDetails.creatorID.toString() !== authActiveProfileId.toString()
  ) {
    console.error("Card not found or not owned by user");
    redirect("/");
  }

  cardDetails.status = "Modifying";

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        authActiveProfileId={authActiveProfileId}
        cardId={cardDetails.cardID}
        cardDetails={cardDetails}>
        <CardEditorNavigation
          cardDetails={cardDetails}
          authActiveProfileId={authActiveProfileId}
          cardId={params.cardId}
        />
        <CardEditorSidebar />
        <div
          style={{ backgroundImage: "url('../paper-dark.svg')" }}
          className="h-full flex justify-center">
          <CardEditor componentId={cardDetails.components} />
        </div>
        <CardEditorRightSidebar />
      </EditorProvider>
    </div>
  );
};

export default Page;
