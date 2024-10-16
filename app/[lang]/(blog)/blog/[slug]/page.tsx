import React from "react";
import Container from "@/components/blog/container";
import Header from "@/components/blog/header";
import { PostBody } from "@/components/blog/post-body";
import { PostHeader } from "@/components/blog/post-header";
import { getBlogBySlug, getCreatorInfo } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pen } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import {
  fetchCurrentActiveProfileId,
  loadBlogComment,
  getImage,
  getProfileName,
} from "@/lib/actions/user.actions";
import { isFlexAdmin } from "@/lib/actions/user.actions";
import DeleteBlogModal from "../delete/DeleteBlogModal";
import BlogCommentList from "../comment/_components/BlogCommentList";
import { redirect } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";

interface BlogProps {
  params: { slug: string; lang: string };
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

export async function generateMetadata({ params }: BlogProps) {
  const { slug } = params;
  const blogResponse = await getBlogBySlug(slug);

  const blog = blogResponse.blogs;

  if (!blog) {
    return {
      title: "Blog post not found",
      description: "The blog post you are looking for does not exist.",
    };
  }

  const metadataBase = new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  );

  let imageUrl = null;
  try {
    const domainName = process.env.NEXT_PUBLIC_BASE_URL;
    const fullApiUrl = `${domainName}/api/blog-image-load/${blog.image}`;

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
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: blog.title,
            },
          ]
        : undefined,
    },
    metadataBase,
  };
}

export default async function BlogPostPage({ params }: BlogProps) {
  const { slug, lang } = params;

  const dict = await getDictionary(lang);

  const blogResponse = await getBlogBySlug(slug);
  if (!blogResponse.success) {
    redirect("/blog");
  }

  const blog = blogResponse.blogs;

  const creatorInfo = await getCreatorInfo(blog.author);

  const allBlogCommentsResponse = await loadBlogComment(blog._id);
  const comments = allBlogCommentsResponse?.comments || [];

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

  if (!session) {
    return <p>You need to log in to see this page.</p>;
  }

  if (user && blog) {
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

    if (blog.author) {
      isCreator = blog.author.toString() === currentUserProfileId.toString();
    }
    isAdmin = await isFlexAdmin(user?.id);
  }

  return (
    <>
      <Header dict={dict} />

      <div className="flex justify-end gap-4 px-6 sm:px-8 lg:px-12 py-4">
        {/* Show the Edit button if the user is the creator or admin */}
        {(isAdmin || isCreator) && (
          <Button>
            <Link
              href={`/blog/edit/${blog._id}`}
              className="flex items-center gap-2"
            >
              {dict.blog.edit.edit}
              <Pen />
            </Link>
          </Button>
        )}

        {/* Show the Delete button if the user is an admin */}
        {isAdmin && (
          <DeleteBlogModal
            blogId={blog._id}
            coverImage={blog.image}
            currentUserProfileId={currentUserProfileId}
            dict={dict}
          />
        )}
      </div>

      <div className="mx-auto px-12">
        <Container>
          <article className="mb-32 px-6">
            <PostHeader
              title={blog.title}
              coverImage={blog.image}
              date={blog.createdAt}
              author={creatorInfo.accountname}
              authorImg={creatorInfo.imageUrl}
              dict={dict}
            />
            <PostBody content={blog.excerpt} />
          </article>
        </Container>
      </div>
      <div className="mx-auto px-12">
        <Container>
          <article className="mb-32 px-6">
            <BlogCommentList
              blogId={blog._id}
              comments={comments}
              currentUserProfileId={currentUserProfileId || ""}
              currentUserImg={currentUserImg.image || ""}
              currentUserName={currentUserProfileName.accountname || ""}
              isAdmin={isAdmin}
              dict={dict}
            />
          </article>
        </Container>
      </div>
    </>
  );
}
