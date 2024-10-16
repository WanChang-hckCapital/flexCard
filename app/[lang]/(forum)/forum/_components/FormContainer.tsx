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
  dict: any;
  lang: any;
}

export default function ForumContainer({
  isLogin,
  isAdmin,
  authActiveProfileId,
  initialForums,
  initialForumTypes,
  dict,
  lang,
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
    <div className="min-h-screen w-full dark:bg-black dark:text-white bg-white text-black">
      <div className="container flex justify-end mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <ForumActionBar
          isLogin={isLogin}
          isAdmin={isAdmin}
          authActiveProfileId={authActiveProfileId}
          initialForumTypes={forumTypes}
          onForumTypeClick={handleForumTypeClick}
          dict={dict}
          lang={lang}
        />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {currentForums.length > 0 ? (
          <section>
            <ForumList forums={currentForums} dict={dict} lang={lang} />
            <Pagination
              forumsPerPage={forumsPerPage}
              totalForums={forums.length}
              paginate={paginate}
              currentPage={currentPage}
              dict={dict}
            />
          </section>
        ) : (
          <p>
            {dict.forum.forumcontentnofound.forumcontentnofound_1}{" "}
            {selectedForumTypeName
              ? dict.forum.forumtype[selectedForumTypeName] ||
                selectedForumTypeName
              : "this type"}{" "}
            {dict.forum.forumcontentnofound.forumcontentnofound_2}{" "}
          </p>
        )}
      </div>
    </div>
  );
}
