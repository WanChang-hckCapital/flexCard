"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/forum/header";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import {
  fetchCurrentActiveProfileId,
  isProfileAdmin,
  getProfileImage,
  checkIsCreator,
  getForumById,
  updateForum,
  checkUniqueSlugForum,
} from "@/lib/actions/user.actions";
import { useRouter, useParams } from "next/navigation";
import ForumEditor from "../_component/ForumEditor";
import { toast } from "sonner";
import LoadingSpinner from "@/app/(workspace)/workspace/chatroom/_components/LoadingSpinner";

interface Forum {
  _id: string;
  title: string;
  slug: string;
  expert: string;
  image: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogEdit() {
  const { data: clientSession } = useSession();
  const router = useRouter();
  const { forumId } = useParams();

  const parsedForumId = Array.isArray(forumId) ? forumId[0] : forumId;

  const [authActiveProfileId, setAuthActiveProfileId] = useState<string | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [isInvitedCreator, setIsInvitedCreator] = useState<boolean>(false);

  // const [blog, setBlog] = useState(null);
  const [forum, setForum] = useState<Forum | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function fetchBlogData() {
      try {
        if (parsedForumId) {
          const forumResponse = await getForumById(parsedForumId);
          if (forumResponse.success) {
            setForum(forumResponse.forums);
          } else {
            router.push("/forum");
            return;
          }
        }

        if (clientSession) {
          const user = clientSession.user;

          if (user?.name) setAccountName(user.name);

          const authActiveProfileIdResponse = await fetchCurrentActiveProfileId(
            user.id
          );
          setAuthActiveProfileId(authActiveProfileIdResponse);

          if (authActiveProfileIdResponse) {
            // Check if user is admin
            const adminCheck = await isProfileAdmin(
              authActiveProfileIdResponse
            );

            // Check if the user is the creator of the blog
            const creatorCheck = await checkIsCreator(
              authActiveProfileIdResponse
            );

            if (adminCheck.success || creatorCheck.success) {
              setIsAdmin(adminCheck.success);
              setIsInvitedCreator(creatorCheck.success);
            } else {
              router.push("/forum");
              return;
            }

            const pictureUrl = await getProfileImage(
              authActiveProfileIdResponse
            );
            if (pictureUrl.success) {
              setImageUrl(pictureUrl.imageUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching blog data:", error);
        router.push("/blog");
      } finally {
        setLoading(false);
      }
    }

    fetchBlogData();
  }, [clientSession, parsedForumId, router]);

  // upload
  const handleSubmit = async (updatedData: any) => {
    if (!authActiveProfileId || !parsedForumId) return;

    try {
      if (forum && updatedData.title.trim() !== forum.title.trim()) {
        const isUniqueTitle = await checkUniqueSlugForum(
          updatedData.title.trim()
        );
        if (!isUniqueTitle.success) {
          setMessage(isUniqueTitle.message);
          toast.error(isUniqueTitle.message);
          return;
        }
      }

      let imageId = null;

      if (updatedData.imageFile) {
        // delete the previous image
        if (forum && forum.image) {
          const response = await fetch(
            `/api/forum-image-delete/${forum.image}`,
            {
              method: "DELETE",
            }
          );
          if (response.ok) {
            toast.success("Previous image deleted successfully.");
          } else {
            toast.error("Failed to delete the image.");
            return;
          }
        }

        // submit the new image
        const formData = new FormData();
        formData.append("imageFile", updatedData.imageFile as File);

        const imageUploadResponse = await fetch("/api/forum-image-submit", {
          method: "POST",
          body: formData,
        });

        if (imageUploadResponse) {
          const result = await imageUploadResponse.json();
          imageId = result.fileId;
          // toast(result.message);
        } else {
          console.error("Failed to upload new thumbnail.");
          return;
        }
      }

      const forumData = {
        title: updatedData.title,
        content: updatedData.content,
        imageId: imageId,
      };

      const response = await updateForum(
        parsedForumId,
        authActiveProfileId,
        forumData
      );

      if (response.success) {
        router.push("/forum");
      } else {
        console.error("Error updating forum");
      }
    } catch (error: any) {
      console.error("Error during submission:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin && !isInvitedCreator) {
    router.push("/forum");
    return null;
  }

  return (
    <div className="bg-black">
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
            <ForumEditor
              initialData={forum}
              onSubmit={handleSubmit}
              message={message}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
