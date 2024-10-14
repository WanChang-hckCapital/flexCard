"use client";

import React from "react";
import ForumItem from "./ForumItem";

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

export default function ForumList({ forums }: { forums: Forum[] }) {
  return (
    <section>
      <div className="grid gap-8">
        {forums.map((forum, index) => (
          <ForumItem key={index} forum={forum} />
        ))}
      </div>
    </section>
  );
}
