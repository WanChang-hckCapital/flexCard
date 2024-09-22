"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-4 p-4 md:p-6">
      {[...Array(14)].map((_, index) => (
        <div
          key={index}
          className={`flex items-center ${
            index % 2 === 0 ? "justify-start" : "justify-end"
          } w-full`}
        >
          <div className="flex items-center space-x-4">
            {index % 2 === 0 && (
              <>
                <Skeleton className="h-12 w-12 rounded-full bg-white" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px] bg-white" />
                  <Skeleton className="h-4 w-[200px] bg-white" />
                </div>
              </>
            )}
            {index % 2 === 1 && (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px] bg-white" />
                  <Skeleton className="h-4 w-[200px] bg-white" />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
