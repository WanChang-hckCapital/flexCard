"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCard: React.FC = () => {
  return (
    <div className="block mb-12">
      <div className="h-[450px] w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <Skeleton className="w-full h-40 bg-gray-200" />
        <div className="p-4 flex flex-col flex-grow">
          <Skeleton className="h-6 w-3/12 mb-8 bg-gray-200" />
          <Skeleton className="h-6 mb-4 bg-gray-200" />
          <Skeleton className="h-6 mb-4 bg-gray-200" />
          <Skeleton className="h-6 mb-4 bg-gray-200" />
        </div>
        <div className="p-4 flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px] bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
