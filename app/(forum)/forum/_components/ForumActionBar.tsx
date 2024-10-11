"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pen, X } from "lucide-react";
import Link from "next/link";
import ForumSearchBar from "./ForumSearchBar";
import {
  handleForumSearch,
  addNewForumType,
  loadForumType,
} from "@/lib/actions/user.actions";

interface ForumType {
  _id: string;
  name: string;
  active: boolean;
}

interface Forum {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
  forumType: ForumType;
  viewCount: number;
  commentCount: number;
  createdAt: Date;
}

interface ForumActionBarProps {
  isLogin: boolean;
  isAdmin: boolean;
  authActiveProfileId: string | null;
  initialForumTypes: any[];
  onForumTypeClick: (forumTypeId: string) => void;
}

export default function ForumActionBar({
  isLogin,
  isAdmin,
  authActiveProfileId,
  initialForumTypes,
  onForumTypeClick,
}: ForumActionBarProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Forum[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const [newForumType, setNewForumType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [forumTypes, setForumTypes] = useState<any[]>(initialForumTypes);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  // show text that find
  const truncateTextWithMatch = (
    content: string,
    keyword: string,
    maxLength: number
  ) => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedKeyword})`, "gi");

    const matchIndex = content.toLowerCase().indexOf(keyword.toLowerCase());

    // not exist
    if (matchIndex === -1) {
      return content.length > maxLength
        ? content.substring(0, maxLength) + "..."
        : content;
    }

    const start = Math.max(0, matchIndex - Math.floor(maxLength / 2));
    const truncatedText = content.substring(start, start + maxLength);

    const highlightedContent = truncatedText.replace(
      regex,
      '<span class="bg-yellow-200 font-semibold">$1</span>'
    );

    return highlightedContent + (content.length > maxLength ? "..." : "");
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
    setSearchKeyword(keyword);
    const searchResult = await handleForumSearch(keyword);

    if (
      searchResult.success &&
      searchResult.forums &&
      searchResult.forums.length > 0
    ) {
      setSearchResults(searchResult.forums || []);
      setSearchMessage(null);
    } else {
      setSearchResults([]);
      setSearchMessage("No forums found with the given keyword.");
    }
  };

  const handleCreateForumType = async () => {
    if (!authActiveProfileId) {
      return;
    }

    try {
      await addNewForumType(authActiveProfileId, newForumType, isActive);
      // toast.success("Forum type created successfully!");

      const updatedForumTypes = await loadForumType();

      if (updatedForumTypes.success && updatedForumTypes.forumTypes) {
        setForumTypes(updatedForumTypes.forumTypes);
      }

      setNewForumType("");
      setIsActive(true);
      setDialogOpen(false);
    } catch (error) {
      // toast.error("Failed to create forum type.");
      console.error("Error creating forum type:", error);
    }
  };

  const handleForumTypeClick = (forumTypeId: string) => {
    setSelectedTypeId(forumTypeId);
    onForumTypeClick(forumTypeId);
  };

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchResults([]);
    setSearchMessage(null);
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex justify-end items-center space-x-2">
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-black">
                <div className="flex items-center gap-2">
                  Create New Forum Type
                  <Pen />
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-white">
                  Create New Forum Type
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white" htmlFor="forumType">
                    Forum Type
                  </Label>
                  <Input
                    id="forumType"
                    type="text"
                    value={newForumType}
                    onChange={(e) => setNewForumType(e.target.value)}
                    placeholder="Enter forum type"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white" htmlFor="activeStatus">
                    Active Status
                  </Label>
                  <select
                    id="activeStatus"
                    value={isActive ? "Active" : "Inactive"}
                    onChange={(e) => setIsActive(e.target.value === "Active")}
                    className="w-full border border-gray-300 rounded p-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost">Cancel</Button>
                <Button variant="outline" onClick={handleCreateForumType}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {isLogin && (
          <Button variant="outline" className="text-black">
            <Link href="/forum/create" className="flex items-center gap-2">
              Create
              <Pen />
            </Link>
          </Button>
        )}
      </div>
      <div className="flex items-center flex-1 relative w-full">
        <div className="flex items-center flex-1 relative w-full space-x-2">
          <div className="flex-grow">
            <ForumSearchBar
              value={searchKeyword}
              onSearchClick={handleSearchClick}
            />
          </div>
          {searchKeyword && (
            <Button
              onClick={clearSearch}
              variant="ghost"
              className="p-2"
              aria-label="Clear search"
            >
              <X className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {forumTypes.map((type, index) => (
            <Button
              key={index}
              onClick={() => handleForumTypeClick(type._id)}
              className={`px-4 py-2 rounded-lg border focus:outline-none ${
                selectedTypeId === type._id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-black"
              }`}
            >
              {type.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-black">
        {searchResults.length > 0 && (
          <div className="grid gap-4">
            {searchResults.map((forum, index) => (
              <div key={index} className="relative p-4 bg-gray-200 rounded">
                <Link href={`/forum/${forum.slug}`}>
                  <h3 className="text-lg font-bold">{forum.title}</h3>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: truncateTextWithMatch(
                        forum.content,
                        searchKeyword,
                        100
                      ),
                    }}
                    className="text-gray-600 mb-4"
                  ></div>

                  <div className="flex justify-between items-end mt-auto">
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
