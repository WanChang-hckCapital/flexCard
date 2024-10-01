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
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import { isFlexAdmin } from "@/lib/actions/user.actions";
import DeleteBlogModal from "../delete/DeleteBlogModal";

interface BlogProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogProps) {
  const { slug } = params;
  const blogResponse = await getBlogBySlug(slug);

  const blog = blogResponse.blogs;

  // const domainName = process.env.NEXT_PUBLIC_BASE_URL;

  if (!blog) {
    return {
      title: "Blog post not found",
      description: "The blog post you are looking for does not exist.",
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      // need or not?
      // images: [
      //   {
      //     url: blog.image,
      //     alt: blog.title,
      //   },
      // ],
    },
  };
}

export default async function BlogPostPage({ params }: BlogProps) {
  const { slug } = params;

  const blogResponse = await getBlogBySlug(slug);
  const blog = blogResponse.blogs;

  const creatorInfo = await getCreatorInfo(blog.author);

  const session = await getServerSession(authOptions);
  const user = session?.user;

  let isCreator = false;
  let isAdmin = false;
  let currentUserProfileId = "";

  if (user) {
    currentUserProfileId = await fetchCurrentActiveProfileId(user?.id);
    isCreator = blog.author.toString() === currentUserProfileId.toString();
    isAdmin = await isFlexAdmin(user?.id);
  }

  if (!blog) {
    return <p>Blog post not found.</p>;
  }

  return (
    <main>
      <Header />

      <div className="flex justify-end gap-4 px-6 sm:px-8 lg:px-12 py-4">
        {/* Show the Edit button if the user is the creator or admin */}
        {(isAdmin || isCreator) && (
          <Button variant="outline" className="text-black">
            <Link
              href={`/blog/edit/${blog._id}`}
              className="flex items-center gap-2"
            >
              Edit
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
            />
            <PostBody content={blog.excerpt} />
          </article>
        </Container>
      </div>
    </main>
  );
}

type Params = {
  params: {
    slug: string;
  };
};
