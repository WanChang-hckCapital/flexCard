import React from "react";
import Link from "next/link";
import { ArrowLeftCircle } from "lucide-react";

interface NavbarProps {
  dict: any;
}

const NavBar: React.FC<NavbarProps> = ({ dict }) => {
  return (
    <nav className="fixed top-0 left-0 w-full dark:bg-gray-800 dark:text-white dark:bg-white text-black p-4 z-50 border-b">
      <div className="w-11/12 mx-auto flex justify-start items-center">
        <Link href="/">
          <ArrowLeftCircle
            width={24}
            height={24}
            className="cursor-pointer dark:text-black text-black"
          />
        </Link>
        <p className="ml-3 dark:text-black text-black">
          {dict.addfriend.navbar.title}
        </p>
      </div>
    </nav>
  );
};

export default NavBar;
