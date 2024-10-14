"use client";

import { useState, useEffect } from "react";
import ForumList from "./ForumList";
import ForumActionBar from "./ForumActionBar";
import { loadForumByType } from "@/lib/actions/user.actions";
import Pagination from "./Pagination";

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

interface ForumContainerProps {
  isLogin: boolean;
  isAdmin: boolean;
  authActiveProfileId: string | null;
  initialForums: Forum[];
  initialForumTypes: any[];
}

export default function ForumContainer({
  isLogin,
  isAdmin,
  authActiveProfileId,
  initialForums,
  initialForumTypes,
}: ForumContainerProps) {
  const [forums, setForums] = useState<Forum[]>(initialForums);
  const [forumTypes, setForumTypes] = useState(initialForumTypes);

  const [selectedForumTypeName, setSelectedForumTypeName] = useState<
    string | null
  >(null);

  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [forumsPerPage] = useState(5); // forum per page

  const handleForumTypeClick = async (forumTypeId: string) => {
    const selectedType = forumTypes.find((type) => type._id === forumTypeId);
    if (selectedType) {
      setSelectedForumTypeName(selectedType.name);
    }

    const forumsResponse = await loadForumByType(forumTypeId);
    if (forumsResponse.success && forumsResponse.forums) {
      setForums(forumsResponse.forums as Forum[]);
      setCurrentPage(1);
    } else {
      setForums([]);
    }
  };

  const indexOfLastForum = currentPage * forumsPerPage;
  const indexOfFirstForum = indexOfLastForum - forumsPerPage;
  const currentForums = forums.slice(indexOfFirstForum, indexOfLastForum);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="container flex justify-end mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <ForumActionBar
          isLogin={isLogin}
          isAdmin={isAdmin}
          authActiveProfileId={authActiveProfileId}
          initialForumTypes={forumTypes}
          onForumTypeClick={handleForumTypeClick}
        />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {currentForums.length > 0 ? (
          <section>
            <ForumList forums={currentForums} />
            <Pagination
              forumsPerPage={forumsPerPage}
              totalForums={forums.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </section>
        ) : (
          <p>No forums available for {selectedForumTypeName || "this type"}.</p>
        )}
      </div>
    </div>
  );
}
