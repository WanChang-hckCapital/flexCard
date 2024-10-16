"use client";

interface BlogHeaderProps {
  dict: any;
}

export default function Header({ dict }: BlogHeaderProps) {
  return (
    <header className="dark:bg-black dark:text-white dark:shadow-custom-shadow bg-white text-black shadow-custom-shadow shadow-md transition-shadow py-4 mb-6">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        <div className="text-2xl font-bold">{dict.blog.blog.navtitle}</div>
      </div>
    </header>
  );
}
