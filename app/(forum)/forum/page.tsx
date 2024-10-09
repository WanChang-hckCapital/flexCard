import * as React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import {
  fetchCurrentActiveProfileId,
  loadForums,
} from "@/lib/actions/user.actions";
import Header from "@/components/forum/header";
import ForumList from "./_components/ForumList";
import ForumActionBar from "./_components/ForumActionBar";

interface Forum {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
}

interface forumResponse {
  success: boolean;
  message: string;
  forums?: Forum[];
  error?: string;
}

async function Forum() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let isLogin = !!user;
  let authActiveProfileId: string | null = null;
  let forums: Forum[] = [];

  let isSearchBarVisible = true;

  if (isLogin) {
    const authUserId = user!.id.toString();
    authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);
  }

  const forumsResponse: forumResponse = await loadForums();

  if (forumsResponse.success && forumsResponse.forums) {
    forums = forumsResponse.forums;
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <Header />
      <div className="container flex justify-end mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <ForumActionBar isLogin={isLogin} />
      </div>
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {forums.length > 0 ? (
          <section>
            <ForumList forums={forums} />
          </section>
        ) : (
          <p>No forums available.</p>
        )}
      </div>
    </div>
  );
}

export default Forum;
