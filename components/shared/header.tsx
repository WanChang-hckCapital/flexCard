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
import { Heart, Menu, MessageSquare, User } from "lucide-react";
import { Session } from "next-auth";
import SignInButton from "../buttons/signin-button";
import SignOutButton from "../buttons/signout-button";
import Searchbar from "../Searchbar";
import { UserImage } from "@/types";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import { MdOutlineAddBox } from "react-icons/md";
import LanguageSwitcher from "../language-switcher";

interface HeaderProps {
  session: Session | null;
  userInfoImage: UserImage | null | undefined;
  dict: any;
}

async function Header({ session, userInfoImage, dict }: HeaderProps) {
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
      <nav className="topbar shadow-xl dark:text-gray-300 dark:bg-black bg-white">
        {/* logo */}
        <div className="flex">
          <Link href="/">
            <span className="head-text font-bold text-gray-800 dark:text-white">
              flxBubble
            </span>
          </Link>
        </div>

        <Searchbar routeType={""} />

        <div className="flex items-center gap-4 w-50">
          <Link href="/workspace/create-card">
            <MdOutlineAddBox
              className="text-gray-800 dark:text-white"
              size={24}
            />
          </Link>

          {/* <Link href="/notifications">
                        <Image width={24} height={24}
                            className=""
                            src='/assets/heart.svg'
                            alt='icon heart' />
                    </Link> */}
          {/* <Link href="/workspace/6657da7c793f3b540da23a34"> */}
          <Link href="/workspace/66b332c9339423ac1861e9d8">
            <Heart className="text-gray-800 dark:text-white" size={24} />
          </Link>

          <Link href={`/workspace/chatroom/${userId}`}>
            <MessageSquare
              className="text-gray-800 dark:text-white"
              size={24}
            />
          </Link>

          {/* add more friend page */}
          <Link href="/workspace/add-friend">
            <User className="text-gray-800 dark:text-white" size={24} />
          </Link>
          {/* drop down menu*/}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex">
                <Menu className="text-gray-800 dark:text-white" size={24} />
                {/* {
                                    session?.user &&
                                    <p>{session.user.name?.split(' ')[0]}</p>
                                } */}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-3">
              {session && (
                <DropdownMenuItem className="justify-center">
                  <Link
                    className="flex font-bold text-gray-800 dark:text-white"
                    href={`${session ? "/product" : "api/auth/signin"}`}
                  >
                    {dict.header.subscription}
                  </Link>
                </DropdownMenuItem>
              )}
              {
                <>
                  <DropdownMenuItem className="justify-center">
                    <Link
                      className="font-bold text-gray-800 dark:text-white"
                      // href={`${session ? '/cards/665124264a34e4d57fcc506e' : 'api/auth/signin'}`} >
                      href={"/cards/6673eab3337c9a8447de531d"}
                    >
                      cards testing
                    </Link>
                  </DropdownMenuItem>
                </>
              }
              {
                <>
                  <DropdownMenuItem className="justify-center">
                    <Link
                      className="font-bold text-gray-800 dark:text-white"
                      href={"/contact-us"}
                    >
                      contact us
                    </Link>
                  </DropdownMenuItem>
                </>
              }
              {
                <>
                  <DropdownMenuItem className="justify-center">
                    <Link
                      className="font-bold text-gray-800 dark:text-white"
                      // href={`${session ? '/profile/66511403ce0e911348378718' : 'api/auth/signin'}`} >
                      // href={'/profile/6651901f2dc11fd640957e8a'} >
                      href={"/profile/66b41db4e2c63bb042600381"}
                    >
                      other user test
                    </Link>
                  </DropdownMenuItem>
                </>
              }
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
              {<LanguageSwitcher />}
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
                        className="flex font-bold text-gray-800 dark:text-white"
                        href={`${
                          session
                            ? `/profile/${authActiveProfileId}`
                            : "api/auth/signin"
                        }`}
                      >
                        {dict.header.myCard}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {session && (
                    <>
                      <DropdownMenuItem className="justify-center">
                        <Link
                          className="font-bold text-gray-800 dark:text-white"
                          href={`${session ? "/settings" : "api/auth/signin"}`}
                        >
                          {dict.header.setting}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Link
                          className="font-bold text-gray-800 dark:text-white"
                          href={`${session ? "/dashboard" : "api/auth/signin"}`}
                        >
                          {dict.header.dashboard}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator></DropdownMenuSeparator>
                    </>
                  )}

                  <DropdownMenuItem className="flex text-left py-0 w-full">
                    {session ? (
                      <SignOutButton dict={dict} />
                    ) : (
                      <SignInButton dict={dict} />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SignInButton dict={dict} />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
