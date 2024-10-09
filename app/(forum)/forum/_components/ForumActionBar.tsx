"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pen, X } from "lucide-react";
import Link from "next/link";
import ForumSearchBar from "./ForumSearchBar";
import { handleForumSearch } from "@/lib/actions/user.actions";

interface Forum {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ForumActionBarProps {
  isLogin: boolean;
}

export default function ForumActionBar({ isLogin }: ForumActionBarProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Forum[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

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

  const handleSearchClick = async (keyword: string) => {
    const searchResult = await handleForumSearch(keyword);

    if (
      searchResult.success &&
      searchResult.forums &&
      searchResult.forums.length > 0
    ) {
      setSearchResults(searchResult.forums);
      setSearchMessage(null);
    } else {
      setSearchResults([]);
      setSearchMessage("No forums found with the given keyword.");
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex items-center flex-1 relative w-full">
        <div className="flex-grow">
          <ForumSearchBar
            value={searchKeyword}
            onSearchClick={handleSearchClick}
          />
        </div>
        {/* <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={() => setSearchKeyword("")} // Clear the search bar
        >
          <X className="w-5 h-5 text-gray-500" />
        </Button> */}
      </div>
      {isLogin && (
        <div className="flex justify-end">
          <Button variant="outline" className="text-black">
            <Link href="/forum/create" className="flex items-center gap-2">
              Create
              <Pen />
            </Link>
          </Button>
        </div>
      )}
      <div className="mt-4 text-black">
        {searchResults.length > 0 && (
          <div className="grid gap-4">
            {searchResults.map((forum, index) => (
              <div key={index} className="relative p-4 bg-gray-200 rounded">
                <Link href={`/forum/${forum.slug}`}>
                  <h3 className="text-lg font-bold">{forum.title}</h3>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: truncateText(forum.content, 50),
                    }}
                    className="text-gray-600 mb-4"
                  ></div>

                  <div className="flex justify-between items-end mt-auto">
                    <div></div>

                    <div className="text-xs text-gray-500">
                      {formatTime(forum.createdAt.toISOString())}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
