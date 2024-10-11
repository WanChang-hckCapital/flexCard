import React from "react";
import Container from "@/components/blog/container";
import Header from "@/components/forum/header";
import { PostBody } from "@/components/forum/post-body";
import { PostHeader } from "@/components/forum/post-header";
import { getCreatorInfo } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pen } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import {
  fetchCurrentActiveProfileId,
  loadForumComment,
  getImage,
  getProfileName,
  getForumBySlug,
} from "@/lib/actions/user.actions";
import { isFlexAdmin } from "@/lib/actions/user.actions";
import DeleteForumModal from "../delete/_component/DeleteForumModal";
import ForumCommentList from "../comment/_component/ForumCommentList";
import { redirect } from "next/navigation";

interface ForumProps {
  params: { slug: string };
}

interface UserImage {
  success: boolean;
  message: string;
  image: string | null;
}

interface UserAccountname {
  success: boolean;
  message: string;
  accountname: string | null;
}

export async function generateMetadata({ params }: ForumProps) {
  const { slug } = params;
  const forumResponse = await getForumBySlug(slug);

  const forum = forumResponse.forums;

  if (!forum) {
    return {
      title: "Forum post not found",
      description: "The forum post you are looking for does not exist.",
    };
  }

  const metadataBase = new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  );

  let imageUrl = null;
  try {
    const domainName = process.env.NEXT_PUBLIC_BASE_URL;
    const fullApiUrl = `${domainName}/api/forum-image-load/${forum.image}`;

    const res = await fetch(fullApiUrl);
    if (!res.ok) {
      console.error(`Failed to fetch image. Status: ${res.status}`);
    } else {
      const imageData = await res.json();
      imageUrl = imageData?.fileDataUrl;
    }
  } catch (error) {
    console.error("Error fetching image for metadata:", error);
  }

  return {
    title: forum.title,
    description: forum.excerpt,
    openGraph: {
      title: forum.title,
      description: forum.content,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: forum.title,
            },
          ]
        : undefined,
    },
    metadataBase,
  };
}

export default async function ForumPostPage({ params }: ForumProps) {
  const { slug } = params;

  const forumResponse = await getForumBySlug(slug);
  if (!forumResponse.success) {
    redirect("/forum");
  }

  const forum = forumResponse.forums;

  const creatorInfo = await getCreatorInfo(forum.author);

  const allForumsCommentsResponse = await loadForumComment(forum._id);

  const comments = allForumsCommentsResponse?.comments || [];

  let isCreator = false;
  let isAdmin = false;
  let currentUserProfileId = "";
  let currentUserProfileName: UserAccountname = {
    success: false,
    message: "",
    accountname: "",
  };
  let currentUserImg: UserImage = {
    success: false,
    message: "",
    image: null,
  };

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (user && forum) {
    currentUserProfileId = await fetchCurrentActiveProfileId(user?.id);

    const imageResult = await getImage(currentUserProfileId);
    currentUserImg = {
      success: imageResult.success,
      message: imageResult.message,
      image: imageResult.image ?? null,
    };

    const accountNameResult = await getProfileName(currentUserProfileId);
    currentUserProfileName = {
      success: accountNameResult.success,
      message: accountNameResult.message,
      accountname: accountNameResult.accountname,
    };

    if (forum.author) {
      isCreator = forum.author.toString() === currentUserProfileId.toString();
    }
    isAdmin = await isFlexAdmin(user?.id);
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <Header />

      <div className="flex justify-end gap-4 px-6 sm:px-8 lg:px-12 py-4 bg-black">
        {/* Show the Edit button if the user is the creator or admin */}
        {(isAdmin || isCreator) && (
          <Button variant="outline" className="text-black">
            <Link
              href={`/forum/edit/${forum._id}`}
              className="flex items-center gap-2"
            >
              Edit
              <Pen />
            </Link>
          </Button>
        )}

        {/* Show the Delete button if the user is an admin */}
        {isAdmin && (
          <DeleteForumModal
            forumId={forum._id}
            coverImage={forum.image}
            currentUserProfileId={currentUserProfileId}
          />
        )}
      </div>

      <div className="mx-auto px-12 bg-black text-white">
        <Container>
          <article className="px-6">
            <PostHeader
              title={forum.title}
              coverImage={forum.image}
              date={forum.createdAt}
              author={creatorInfo.accountname}
              authorImg={creatorInfo.imageUrl}
            />
            <PostBody content={forum.content} />
          </article>
        </Container>
      </div>
      <div className="mx-auto px-12">
        <Container>
          <article className="px-6">
            <ForumCommentList
              forumId={forum._id}
              comments={comments}
              currentUserProfileId={currentUserProfileId || ""}
              currentUserImg={currentUserImg.image || ""}
              currentUserName={currentUserProfileName.accountname || ""}
              isAdmin={isAdmin}
            />
          </article>
        </Container>
      </div>
    </div>
  );
}
