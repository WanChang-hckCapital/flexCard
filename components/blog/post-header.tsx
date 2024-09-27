"use client";

import React, { useEffect, useState } from "react";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date.formatter";
import { PostTitle } from "./post-title";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: string;
  authorImg: string;
};

export function PostHeader({
  title,
  coverImage,
  date,
  author,
  authorImg,
}: Props) {
  const [blogImg, setBlogImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogImage = async (imageId: string) => {
      try {
        const res = await fetch(`/api/blog-image-load/${imageId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch image. Status: ${res.status}`);
        }
        const data = await res.json();
        setBlogImg(data.fileDataUrl);
      } catch (err) {
        setError("Error fetching blog image");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (coverImage) {
      fetchBlogImage(coverImage);
    }
  }, [coverImage]);

  if (loading) return <p>Loading image...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="mb-8 md:mb-16 sm:mx-0 ">
        {blogImg && <CoverImage title={title} src={blogImg} />}
      </div>
      <div className="mx-auto">
        <div className="mb-12 text-lg">
          <DateFormatter dateString={new Date(date).toISOString()} />
        </div>
        <div className="hidden md:block md:mb-12">
          <Avatar name={author} picture={authorImg} />
        </div>
      </div>
    </>
  );
}
