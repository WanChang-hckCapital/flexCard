"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ForumSearchBar from "./ForumSearchBar";
import { Pen, X } from "lucide-react";
import Link from "next/link";

interface ForumHeaderBarProps {
  isSearchBarVisible: boolean;
  onSearch: (keyword: string) => void;
}

export default function ForumHeaderBar({
  isSearchBarVisible,
  onSearch,
}: ForumHeaderBarProps) {
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearchClick = (keyword: string) => {
    onSearch(keyword);
  };

  return (
    <div className="flex items-center justify-between w-full">
      {isSearchBarVisible && (
        <div className="flex items-center flex-1 mr-4 relative">
          <div className="flex-grow">
            <ForumSearchBar
              value={searchKeyword}
              onSearchClick={handleSearchClick}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={() => setSearchKeyword("")}
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
      )}
      <Button variant="outline" className="text-black">
        <Link href="/forum/create" className="flex items-center gap-2">
          Create
          <Pen />
        </Link>
      </Button>
    </div>
  );
}
