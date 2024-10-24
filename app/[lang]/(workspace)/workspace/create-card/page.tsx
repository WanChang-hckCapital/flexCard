// "use client"

import { redirect } from "next/navigation";
import React from "react";
import CardEditorNavigation from "./_components/card-editor-navigation";
import CardEditorSidebar from "./_components/card-editor-sidebar";
import CardEditor from "./_components/card-editor";
import EditorProvider from "@/lib/editor/editor-provider";
import { Card } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import {
  generateCustomID,
  analyzeImage,
  autoCropEdgeImage,
  callChatGpt,
} from "@/lib/utils";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";

type Props = {
  params: {
    userId: string;
    authaccountId: string;
  };
};

interface Vertex {
  x: number;
  y: number;
}

interface Match {
  label: string;
  value: string;
  blockType: string;
  vertices: Vertex[];
  originalText: string;
}

// crop image
interface NormalizedVertex {
  x: number;
  y: number;
}

interface BoundingPoly {
  normalizedVertices: NormalizedVertex[];
}

interface ObjectAnnotation {
  name?: string;
  score?: number;
  boundingPoly?: BoundingPoly;
}

interface CropEdgeImageResult {
  objectAnnotations?: ObjectAnnotation[];
}

const Page = async ({ params }: Props) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  //modify later
  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  console.log("authActiveProfileId: " + authActiveProfileId);

  const newCardData: Card = {
    cardID: generateCustomID(),
    creator: authActiveProfileId,
    title: "Temp Card",
    status: "Developing",
    description: "",
    likes: [],
    followers: [],
    categories: [],
    components: [],
    lineFormatComponent: [],
    flexFormatHtml: [],
    updatedAt: new Date(),
    createdAt: new Date(),
    totalViews: 0,
    viewDetails: [],
    updateHistory: [],
    comments: [],
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        authActiveProfileId={authActiveProfileId}
        cardId={newCardData.cardID}
        cardDetails={newCardData}
      >
        <CardEditorNavigation
          cardDetails={newCardData}
          authActiveProfileId={authActiveProfileId}
        />
        <div
          style={{ backgroundImage: "url('/assets/paper-dark.svg')" }}
          className="h-full flex justify-center dark:bg-black bg-stone-800"
        >
          <CardEditor />
        </div>

        <CardEditorSidebar />
      </EditorProvider>
    </div>
  );
};

export default Page;
