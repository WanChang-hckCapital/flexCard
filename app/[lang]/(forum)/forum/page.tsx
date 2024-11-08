import * as React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import {
  fetchCurrentActiveProfileId,
  loadForums,
  isFlexAdmin,
  loadForumType,
} from "@/lib/actions/user.actions";
import Header from "@/components/forum/header";
import ForumContainer from "./_components/FormContainer";
import { getDictionary } from "../../dictionaries";

interface ForumType {
  _id: string;
  name: string;
  active: boolean;
}

interface Forum {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
  forumType: ForumType;
  viewCount: number;
  commentCount: number;
  createdAt: Date;
}

interface forumResponse {
  success: boolean;
  message: string;
  forums?: Forum[];
  error?: string;
}

async function Forum({ params }: { params: { lang: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let isLogin = !!user;
  let authActiveProfileId: string | null = null;
  let forums: Forum[] = [];
  let isAdmin = false;
  let forumTypes = [];

  const dict = await getDictionary(params.lang);

  if (isLogin) {
    const authUserId = user!.id.toString();
    authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);
    isAdmin = await isFlexAdmin(authUserId);
  }

  const forumsResponse: any = await loadForums();

  if (forumsResponse.success && forumsResponse.forums) {
    forums = forumsResponse.forums;
  }

  const forumTypesResponse = await loadForumType();

  if (forumTypesResponse.success && forumTypesResponse.forumTypes) {
    forumTypes = forumTypesResponse.forumTypes;
  }

  return (
    <div className="min-h-screen w-full dark:bg-black dark:text-white bg-white text-black">
      <Header dict={dict} />
      <ForumContainer
        isLogin={isLogin}
        isAdmin={isAdmin}
        authActiveProfileId={authActiveProfileId}
        initialForums={forums}
        initialForumTypes={forumTypes}
        dict={dict}
        lang={params.lang}
      />
    </div>
  );
}

export default Forum;
