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

export default function ForumList({
  forums,
  dict,
  lang,
}: {
  forums: Forum[];
  dict: any;
  lang: any;
}) {
  return (
    <section>
      <div className="grid gap-8">
        {forums.map((forum, index) => (
          <ForumItem key={index} forum={forum} dict={dict} lang={lang} />
        ))}
      </div>
    </section>
  );
}
