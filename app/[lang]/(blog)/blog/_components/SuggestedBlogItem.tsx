"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCreatorInfo } from "@/lib/actions/user.actions";
import SkeletonCard from "./SkeletonCard";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  author: string;
}

export default function SuggestedBlogItem({ post }: { post: Blog }) {
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [creatorImg, setCreatorImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // blog image
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const fetchBlogImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/blog-image-load/${imageId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch image. Status: ${res.status}`);
      }

      const data = await res.json();
      return data.fileDataUrl;
    } catch (err) {
      console.error("Error fetching blog image:", err);
      setError("Failed to load image");
      return null;
    }
  };

  useEffect(() => {
    async function fetchCreatorInfo() {
      try {
        const creatorInfo = await getCreatorInfo(post.author);
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

    if (post.author) {
      fetchCreatorInfo();
    }
  }, [post.author]);

  useEffect(() => {
    const fetchImage = async () => {
      const imageUrl = await fetchBlogImage(post.image);
      setImageSrc(imageUrl);
    };

    fetchImage();
  }, [post.image]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  if (loading) return <SkeletonCard />;
  if (error) return <p>{error}</p>;

  if (!imageSrc) {
    return <p>Loading image...</p>;
  }

  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <div className="border rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow h-[400px] flex flex-col">
        <div className="h-48 overflow-hidden">
          <Image
            src={imageSrc}
            alt={post.title}
            width={600}
            height={400}
            layout="responsive"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-4 flex flex-col justify-between flex-grow">
          <h3 className="text-xl font-semibold dark:text-white text-black mb-2">
            {truncateText(post.title, 50)}
          </h3>

          <div
            dangerouslySetInnerHTML={{
              __html: truncateText(post.excerpt, 100),
            }}
            className="dark:text-slate-700 text-gray-600  mb-4"
          ></div>
          <div className="flex items-center mt-auto">
            {creatorImg && (
              <Image
                src={creatorImg}
                alt={creatorName || "Creator"}
                width={32}
                height={32}
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <span className="text-sm dark:text-white text-gray-600">
              {creatorName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
