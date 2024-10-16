"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCreatorInfo, updateForumViews } from "@/lib/actions/user.actions";
import SkeletonCard from "@/app/[lang]/(blog)/blog/_components/SkeletonCard";

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

export default function ForumItem({
  forum,
  dict,
  lang,
}: {
  forum: Forum;
  dict: any;
  lang: any;
}) {
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [creatorImg, setCreatorImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreatorInfo() {
      try {
        const creatorInfo = await getCreatorInfo(forum.author);
        if (
          creatorInfo.success &&
          creatorInfo.accountname &&
          creatorInfo.imageUrl
        ) {
          setCreatorName(creatorInfo.accountname);
          setCreatorImg(creatorInfo.imageUrl);
        } else {
          setError("Creator not found");
        }
      } catch (err) {
        setError("Error fetching creator info");
      } finally {
        setLoading(false);
      }
    }

    if (forum.author) {
      fetchCreatorInfo();
    }
  }, [forum.author]);

  const handleForumClick = async () => {
    try {
      await updateForumViews(forum._id);
    } catch (error) {
      console.error("Error updating forum views:", error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const formatTime = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - messageDate.getTime()) / 1000
    );
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else {
      const day = messageDate.getDate();
      const month = messageDate
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();
      const time = messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${day} ${month} AT ${time}`;
    }
  };

  if (loading) return <SkeletonCard />;
  if (error) return <p>{error}</p>;

  return (
    <Link
      href={`/forum/${forum.slug}`}
      className="block group"
      onClick={handleForumClick}
    >
      <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-auto flex flex-col dark:bg-gray-900 group-hover:bg-gray-800 dark:text-white">
        <div className="p-6 flex flex-col justify-between flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {creatorImg && (
                <Image
                  src={creatorImg}
                  alt={creatorName || "Creator"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full mr-4 object-cover"
                />
              )}
              <div>
                <h3 className="text-xl font-bold dark:text-white text-black leading-snug group-hover:text-blue-400 transition-colors duration-300">
                  {truncateText(forum.title, 60)}
                </h3>
                <span className="text-sm text-gray-400 block mt-1">
                  {formatTime(forum.createdAt.toISOString())}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 dark:text-white px-2 py-1 rounded-full text-xs">
                {forum.viewCount}{" "}
                {forum.viewCount > 0
                  ? dict.forum.frontenddisplay.views
                  : dict.forum.frontenddisplay.views}
              </span>
              <span className="bg-blue-600 dark:text-white px-2 py-1 rounded-full text-xs">
                {forum.commentCount}{" "}
                {forum.commentCount > 0
                  ? dict.forum.frontenddisplay.comments
                  : dict.forum.frontenddisplay.comments}
              </span>
              <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                {dict.forum.forumtype[forum.forumType.name] ||
                  forum.forumType.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
