"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import SkeletonCard from "./SkeletonCard";

export default function BlogImage({
  imageId,
  alt,
}: {
  imageId: string;
  alt: string;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    const fetchImage = async () => {
      const imageUrl = await fetchBlogImage(imageId);
      setImageSrc(imageUrl);
    };

    fetchImage();
  }, [imageId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!imageSrc) {
    return <SkeletonCard />;
  }

  return (
    // <div className="w-full h-full">
    <div className="h-48 md:h-full overflow-hidden">
      <Image
        src={imageSrc}
        alt={alt}
        width={800}
        height={500}
        layout="responsive"
        objectFit="cover"
        className="rounded-lg"
      />
    </div>
    // </div>
  );
}
