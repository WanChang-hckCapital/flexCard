import React from "react";
import Link from "next/link";
import { ArrowLeftCircle } from "lucide-react";

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 p-4 z-50">
      <div className="w-11/12 mx-auto flex justify-start items-center">
        <Link href="/">
          <ArrowLeftCircle
            width={24}
            height={24}
            className="cursor-pointer text-white"
          />
        </Link>
        <p className="ml-3">Friends</p>
      </div>
    </nav>
  );
};

export default NavBar;
