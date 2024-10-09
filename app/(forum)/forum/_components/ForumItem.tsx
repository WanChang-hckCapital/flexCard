"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCreatorInfo } from "@/lib/actions/user.actions";
import SkeletonCard from "@/app/(blog)/blog/_components/SkeletonCard";

interface Forum {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  author: string;
}

export default function ForumItem({ forum }: { forum: Forum }) {
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  if (loading) return <SkeletonCard />;
  if (error) return <p>{error}</p>;

  return (
    <Link href={`/forum/${forum.slug}`} className="block">
      <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-auto flex flex-col bg-gray-800">
        <div className="p-6 flex flex-col justify-between flex-grow">
          <div className="flex items-center">
            {creatorImg && (
              <Image
                src={creatorImg}
                alt={creatorName || "Creator"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full mr-3"
              />
            )}
            <h3 className="text-2xl font-semibold text-white leading-tight ">
              {truncateText(forum.title, 50)}
            </h3>
          </div>

          {/* <div
          dangerouslySetInnerHTML={{
            __html: truncateText(forum.content, 100),
          }}
          className="text-gray-400 mb-4 text-base leading-relaxed"
        ></div> */}

          {/* <div className="flex items-center mt-auto">
            <span className="text-sm text-gray-400">{creatorName}</span>
          </div> */}
        </div>
      </div>
    </Link>
  );
}
