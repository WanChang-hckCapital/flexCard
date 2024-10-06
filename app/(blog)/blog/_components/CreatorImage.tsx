"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCreatorInfo } from "@/lib/actions/user.actions";

interface Creator {
  creatorId: string;
}

export function CreatorImage({ creatorId }: { creatorId: string }) {
  const [creatorName, setCreatorName] = useState(null);
  const [creatorImg, setCreatorImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreatorInfo() {
      try {
        const creatorInfo = await getCreatorInfo(creatorId);
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

    if (creatorId) {
      fetchCreatorInfo();
    }
  }, [creatorId]);

  if (loading) return <p>Loading creator...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex items-center">
      <Image
        src={creatorImg || ""}
        alt={creatorName || "Creator's image"}
        width={40}
        height={40}
        className="w-12 h-12 rounded-full mr-4"
      />
      <span className="text-sm text-gray-500">{creatorName}</span>
    </div>
  );
}
