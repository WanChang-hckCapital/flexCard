"use client";

import React from "react";
import SuggestedBlogItem from "./SuggestedBlogItem";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  author: string;
}

export default function SuggestedBlogs({
  blogs,
  dict,
}: {
  blogs: Blog[];
  dict: any;
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">
        {dict.blog.suggestedblog.suggestedblog}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {blogs.map((post, index) => (
          <SuggestedBlogItem key={index} post={post} />
        ))}
      </div>
    </section>
  );
}
