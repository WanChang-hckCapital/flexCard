"use client"

import React from "react";
import { Skeleton } from "./ui/skeleton";

const SkeletonCard: React.FC = () => {
  return (
    <div className="h-auto max-w-fit rounded-lg shadow-lg overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-4">
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    </div>
  );
};

export default SkeletonCard;
