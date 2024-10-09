"use client";

import React from "react";
import ForumItem from "./ForumItem";

interface Forum {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  author: string;
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
