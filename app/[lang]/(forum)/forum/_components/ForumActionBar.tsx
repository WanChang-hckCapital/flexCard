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
  dict: any;
  lang: any;
}

export default function ForumActionBar({
  isLogin,
  isAdmin,
  authActiveProfileId,
  initialForumTypes,
  onForumTypeClick,
  dict,
  lang,
}: ForumActionBarProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Forum[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  // english
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

      const updatedForumTypes = await loadForumType();

      if (updatedForumTypes.success && updatedForumTypes.forumTypes) {
        setForumTypes(updatedForumTypes.forumTypes);
      }

      setNewForumType("");
      // setNewForumTypezhtw("");
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
    <div className="flex flex-col space-y-4 w-full dark:bg-black dark:text-white bg-white text-black">
      <div className="flex justify-end items-center space-x-2">
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <div className="flex items-center gap-2">
                  {dict.forum.create.createnewforumtype}
                  <Pen />
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-black dark:text-white text-black bg-white">
              <DialogHeader>
                <DialogTitle>
                  {dict.forum.create.createnewforumtype}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 dark:bg-black dark:text-white text-black bg-white">
                <div className="space-y-2">
                  <Label htmlFor="forumType_en">
                    {dict.forum.create.forumtype_en}
                  </Label>
                  <Input
                    id="forumType_en"
                    type="text"
                    value={newForumType}
                    onChange={(e) => setNewForumType(e.target.value)}
                    placeholder={dict.forum.create.forumtype_en}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className="dark:text-white text-black"
                    htmlFor="activeStatus"
                  >
                    {dict.forum.create.activestatustitle}
                  </Label>
                  <select
                    id="activeStatus"
                    value={isActive ? "Active" : "Inactive"}
                    onChange={(e) => setIsActive(e.target.value === "Active")}
                    className="w-full border border-gray-300 rounded p-2 text-black"
                  >
                    <option value="Active">{dict.forum.create.active}</option>
                    <option value="Inactive">
                      {dict.forum.create.inactve}
                    </option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button> {dict.forum.create.cancel}</Button>
                <Button onClick={handleCreateForumType}>
                  {" "}
                  {dict.forum.create.create}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {isLogin && (
          <Button>
            <Link href="/forum/create" className="flex items-center gap-2">
              {dict.forum.create.create}
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
                  ? "dark:bg-blue-600 dark:text-slate-600 text-black bg-gray-100 border-blue-600"
                  : "dark:bg-gray-100 dark:text-black text-white"
              }`}
            >
              {dict.forum.forumtype[type.name] || type.name}
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
