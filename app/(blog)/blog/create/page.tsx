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
  checkIsCreator,
} from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import BlogCreator from "./_components/BlogCreator";

export default function BlogCreate() {
  const { data: clientSession } = useSession();
  const router = useRouter();

  const [authActiveProfileId, setAuthActiveProfileId] = useState<string | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInvitedCreator, setIsInvitedCreator] = useState<boolean>(false);

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
          // check whether the user is admin
          const adminCheck = await isProfileAdmin(authActiveProfileIdResponse);
          // check whether the user is a invited creator
          const creatorCheck = await checkIsCreator(
            authActiveProfileIdResponse
          );

          if (adminCheck.success || creatorCheck.success) {
            if (adminCheck.success) {
              setIsAdmin(true);
            }

            if (creatorCheck.success) {
              setIsInvitedCreator(true);
            }
          } else {
            router.push("/blog");
          }

          const pictureUrl = await getProfileImage(authActiveProfileIdResponse);
          if (pictureUrl.success) {
            setImageUrl(pictureUrl.imageUrl);
          }
        }
      }
    }
    fetchActiveProfileId();
  }, [clientSession, router]);

  if (!isAdmin && !isInvitedCreator) {
    return null;
  }

  return (
    <>
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
            <BlogCreator authActiveProfileId={authActiveProfileId} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
