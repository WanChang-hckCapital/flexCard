"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/blog/header";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import {
  fetchCurrentActiveProfileId,
  isProfileAdmin,
  getProfileImage,
  getBlogById,
  //   updateBlog,
} from "@/lib/actions/user.actions";
import { useRouter, useParams } from "next/navigation";
import BlogEditor from "../_components/BlogEditor";

export default function BlogEdit() {
  const { data: clientSession } = useSession();
  const router = useRouter();
  const { blogId } = useParams();

  const parsedBlogId = Array.isArray(blogId) ? blogId[0] : blogId;

  const [authActiveProfileId, setAuthActiveProfileId] = useState<string | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [blog, setBlog] = useState(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActiveProfileId() {
      if (clientSession) {
        const user = clientSession.user;

        if (user.name) setAccountName(user.name);

        const authActiveProfileIdResponse = await fetchCurrentActiveProfileId(
          user.id
        );
        setAuthActiveProfileId(authActiveProfileIdResponse);

        if (authActiveProfileIdResponse) {
          const adminCheck = await isProfileAdmin(authActiveProfileIdResponse);
          if (adminCheck.success) {
            setIsAdmin(true);
          } else {
            router.push("/blog");
          }

          const pictureUrl = await getProfileImage(authActiveProfileIdResponse);
          if (pictureUrl.success) {
            setImageUrl(pictureUrl.imageUrl);
          }
        }

        if (parsedBlogId) {
          const blogResponse = await getBlogById(parsedBlogId);
          if (blogResponse.success) {
            setBlog(blogResponse.blogs);
          } else {
            setBlog(null);
            router.push("/blog");
          }
        }
      }
    }
    fetchActiveProfileId();
  }, [clientSession, blogId, router]);

  const handleSubmit = async (updatedData: any) => {
    if (!authActiveProfileId || !blogId) return;

    // const response = await updateBlog(id, authActiveProfileId, updatedData);
    // if (response.success) {
    //   router.push(`/blog/${id}`);
    // } else {
    //   console.error("Error updating blog");
    // }
  };

  if (!isAdmin || !blog) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <Header />
      <div className="container mx-auto px-6 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            {accountName && (
              <div className="flex justify-center mb-4">
                <span className="text-lg font-bold">{accountName}</span>
              </div>
            )}
            {imageUrl && (
              <div className="flex justify-center mb-4">
                <Image
                  src={imageUrl}
                  alt="Profile Image"
                  width={100}
                  height={100}
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            <BlogEditor
              //   authActiveProfileId={authActiveProfileId}
              initialData={blog}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
