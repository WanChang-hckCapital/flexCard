"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/blog/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pen } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  fetchCurrentActiveProfileId,
  isProfileAdmin,
  loadBlogs,
} from "@/lib/actions/user.actions";
import BlogImage from "./_components/BlogImage";
import { CreatorImage } from "./_components/CreatorImage";
import SuggestedBlogs from "./_components/SuggestedBlogs";
import SkeletonCard from "./_components/SkeletonCard";
import Avatar from "@/components/blog/avatar";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  author: string;
}

interface blogResponse {
  success: boolean;
  message: string;
  blogs?: Blog[];
  error?: string;
}

export default function BlogPage() {
  const { data: clientSession } = useSession();

  const [authActiveProfileId, setAuthActiveProfileId] = useState<string | null>(
    null
  );

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // blog
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [mainPost, setMainPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [suggestedBlogs, setSuggestedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    async function fetchActiveProfileId() {
      if (clientSession) {
        const user = clientSession.user;
        const authActiveProfileId = await fetchCurrentActiveProfileId(user.id);

        setAuthActiveProfileId(authActiveProfileId);
        if (authActiveProfileId) {
          const adminCheck = await isProfileAdmin(authActiveProfileId);

          if (adminCheck.success) {
            setIsAdmin(true);
          }
        }
      }
    }
    fetchActiveProfileId();
  }, [clientSession]);

  useEffect(() => {
    async function loadBlogRes() {
      try {
        const response: blogResponse = await loadBlogs();
        if (response.success && response.blogs) {
          setBlogs(response.blogs);

          setMainPost(response.blogs[0]);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Error loading blogs.");
      } finally {
        setLoading(false);
      }
    }
    loadBlogRes();
  }, []);

  useEffect(() => {
    if (blogs.length > 0) {
      setMainPost(blogs[0]);

      const remainingBlogs = blogs.slice(1);
      setSuggestedBlogs(remainingBlogs);
    }
  }, [blogs]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <Header />
      {isAdmin && (
        <div className="flex justify-end mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <Button variant="outline" className="text-black">
            <Link href="/blog/create" className="flex items-center gap-2">
              Create
              <Pen />
            </Link>
          </Button>
        </div>
      )}

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <main>
          {loading ? (
            <SkeletonCard />
          ) : mainPost ? (
            <Link href={`/blog/${mainPost?.slug}`} className="block mb-12">
              <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-[450px] flex flex-col">
                <div className="grid md:grid-cols-2 items-center">
                  {mainPost.image && (
                    <BlogImage imageId={mainPost.image} alt={mainPost.title} />
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="text-2xl font-semibold mb-4">
                      {truncateText(mainPost.title, 50)}
                    </h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: truncateText(mainPost.excerpt, 50),
                      }}
                      className="text-gray-600 mb-4"
                    ></div>
                    <CreatorImage creatorId={mainPost.author} />
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <p>No main post available.</p>
          )}
        </main>

        {suggestedBlogs.length > 0 && (
          <section>
            <SuggestedBlogs blogs={suggestedBlogs} />
          </section>
        )}
      </div>
    </>
  );
}
