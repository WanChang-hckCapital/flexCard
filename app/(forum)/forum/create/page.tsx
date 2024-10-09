"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/blog/header";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import {
  fetchCurrentActiveProfileId,
  getProfileImage,
} from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import ForumCreator from "./_components/ForumCreator";

export default function ForumCreate() {
  const { data: clientSession, status } = useSession();
  const router = useRouter();

  const [authActiveProfileId, setAuthActiveProfileId] = useState<string | null>(
    null
  );

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);

  //   const [isLogin, setIsLogin] = useState<boolean>(false);

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
          const pictureUrl = await getProfileImage(authActiveProfileIdResponse);
          if (pictureUrl.success) {
            setImageUrl(pictureUrl.imageUrl);
          }
        }
      }
    }

    if (clientSession) {
      fetchActiveProfileId();
    } else if (status === "unauthenticated") {
      router.push("/forum");
    }
  }, [clientSession, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!clientSession) {
    return null;
  }
  return (
    <div className="bg-black">
      <Header />
      <div className="container mx-auto px-6 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            {accountName && (
              <div className="flex justify-center mb-4 text-white">
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
            <ForumCreator authActiveProfileId={authActiveProfileId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
