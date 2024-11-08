"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Avatar from "./avatar";
import DateFormatter from "./date.formatter";
import { PostTitle } from "./post-title";
import Image from "next/image";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: string;
  authorImg: string;
  dict: any;
};

export function PostHeader({
  title,
  coverImage,
  date,
  author,
  authorImg,
  dict,
}: Props) {
  const [blogImg, setBlogImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchForumImage = async (imageId: string) => {
      try {
        const res = await fetch(`/api/forum-image-load/${imageId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch image. Status: ${res.status}`);
        }
        const data = await res.json();
        setBlogImg(data.fileDataUrl);
      } catch (err) {
        setError("Error fetching forum image");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (coverImage) {
      fetchForumImage(coverImage);
    }
  }, [coverImage]);

  if (error) return <p>{error}</p>;

  const handleImageClick = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="mb-8 md:mb-16 sm:mx-0">
        {blogImg && (
          <div
            className={`relative cursor-pointer transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-none" : "max-h-64"
            }`}
            onClick={handleImageClick}
          >
            <Image
              src={blogImg}
              alt={title}
              width={24}
              height={24}
              className={`object-contain w-full transition-all duration-300 ease-in-out ${
                isExpanded ? "h-auto" : "h-64"
              }`}
            />

            {isExpanded && (
              <button className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full z-10">
                <X className="w-6 h-6" onClick={handleImageClick} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mx-auto">
        <div className="mb-12 text-lg">
          <DateFormatter
            dict={dict}
            dateString={new Date(date).toISOString()}
          />
        </div>
        <div className="hidden md:block md:mb-12">
          <Avatar name={author} picture={authorImg} />
        </div>
      </div>
    </>
  );
}
