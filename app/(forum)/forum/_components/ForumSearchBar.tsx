"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ForumSearchBarProps {
  value: string;
  onSearchClick: (keyword: string) => void;
}

function ForumSearchBar({ value, onSearchClick }: ForumSearchBarProps) {
  const [search, setSearch] = useState(value);

  return (
    <div className="relative w-full">
      <Image
        src="/assets/search-gray.svg"
        alt="search"
        width={20}
        height={20}
        className="absolute left-3 top-1/2 transform -translate-y-1/2"
        onClick={() => onSearchClick(search)}
      />
      <Input
        id="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="pl-10 pr-4 py-2 w-full text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}

export default ForumSearchBar;
