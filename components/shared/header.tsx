// "use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Session } from "next-auth";
import SignInButton from "../buttons/signin-button";
import SignOutButton from "../buttons/signout-button";
import Searchbar from "../Searchbar";
import { UserImage } from "@/types";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";

interface HeaderProps {
  session: Session | null;
  userInfoImage: UserImage | null | undefined;
}

async function Header({ session, userInfoImage }: HeaderProps) {
  let authActiveProfileId = "";
  let userId = "";
  let user = null;

  if (session) {
    user = session?.user;
    userId = user.id.toString();

    authActiveProfileId = await fetchCurrentActiveProfileId(userId);
  }

  let userImage = null;
  if (userInfoImage != null) {
    userImage = userInfoImage.binaryCode.toString();
  } else {
    userImage = user?.image;
  }

  return (
    <header className="fixed w-full z-50">
      <nav className="topbar shadow-xl">
        {/* logo */}
        <div className="flex">
          <Link href="/">
            <span className="head-text font-bold">flexCard</span>
          </Link>
        </div>

        <Searchbar routeType={""} />

        <div className="flex items-center gap-4 w-50">
          <Link href="/workspace/create-card">
            <Image
              width={24}
              height={24}
              className=""
              src="/assets/new-card-dark.svg"
              alt="icon create"
            />
          </Link>

          <Link href={`/workspace/chatroom/${userId}`}>
            <Image
              width={24}
              height={24}
              className=""
              src="/assets/chatroom.svg"
              alt="icon create"
            />
          </Link>

          {/* add more friend page */}
          <Link href="/workspace/add-friend">
            <Image
              width={24}
              height={24}
              className=""
              src="/assets/user.svg"
              alt="icon create"
            />
          </Link>
          {/* drop down menu*/}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex">
                <Menu />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-3">
              {session && (
                <DropdownMenuItem className="justify-center">
                  <Link
                    className="flex font-bold"
                    href={`${session ? "/product" : "api/auth/signin"}`}
                  >
                    Subscription
                  </Link>
                </DropdownMenuItem>
              )}
              {
                <>
                  <DropdownMenuItem className="justify-center">
                    <Link className="font-bold" href={"/forum"}>
                      Forum
                    </Link>
                  </DropdownMenuItem>
                </>
              }
              {
                <>
                  <DropdownMenuItem className="justify-center">
                    <Link className="font-bold" href={"/blog"}>
                      Blog
                    </Link>
                  </DropdownMenuItem>
                </>
              }
            </DropdownMenuContent>
          </DropdownMenu>

          <div className={`${session ? "w-8 h-8" : "none"}`}>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div
                    className={`relative ${
                      userImage ? "w-8 h-8" : "h-8"
                    } object-cover content-center`}
                  >
                    {userImage ? (
                      <Image
                        fill
                        className="rounded-full object-cover"
                        src={userImage}
                        alt="icon heart"
                      />
                    ) : (
                      <p>{session.user.name?.split(" ")[0]}</p>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-3">
                  {session && (
                    <DropdownMenuItem className="justify-center">
                      <Link
                        className="flex font-bold"
                        href={`${
                          session
                            ? `/profile/${authActiveProfileId}`
                            : "api/auth/signin"
                        }`}
                      >
                        My Card
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {session && (
                    <>
                      <DropdownMenuItem className="justify-center">
                        <Link
                          className="font-bold"
                          href={`${session ? "/settings" : "api/auth/signin"}`}
                        >
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Link
                          className="font-bold"
                          href={`${session ? "/dashboard" : "api/auth/signin"}`}
                        >
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator></DropdownMenuSeparator>
                    </>
                  )}

                  <DropdownMenuItem className="flex text-left py-0 w-full">
                    {session ? <SignOutButton /> : <SignInButton />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
