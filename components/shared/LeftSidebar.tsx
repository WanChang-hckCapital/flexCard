"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { sidebarLinks } from "@/constants";
import { Session } from "next-auth";
import SignOutButton from "../buttons/signout-button";
import SignInButton from "../buttons/signin-button";
import { Member, UserImage } from "@/types";

interface LeftSidebarProps {
  session: Session | null;
  userInfoImage: UserImage | null | undefined;
}

function LeftSidebar({ session, userInfoImage }: LeftSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const userId = session?.user.id;

  let userImage = null;
  if (userInfoImage != null) {
    userImage = userInfoImage?.binaryCode.toString();
  } else {
    userImage = session?.user.image;
  }

  return (
    // leftsidebar'>
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          if (link.route === "/profile") link.route = `${link.route}/${userId}`;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`leftsidebar_link ${isActive && "bg-primary-500 "}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />

              <p className="text-light-1">{link.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 px-6">
        {session ? (
          <div className="text-center">
            {userImage ? (
              <Link className="leftsidebar_link" href={"/settings"}>
                <Image
                  width={28}
                  height={28}
                  className="rounded-full"
                  src={userImage}
                  alt="user image"
                />
                <p className="align-center text-light-1">
                  {session.user.name?.split(" ")[0]}
                </p>
              </Link>
            ) : (
              <p className="align-center">{session.user.name?.split(" ")[0]}</p>
            )}
          </div>
        ) : session ? (
          <SignOutButton />
        ) : (
          <SignInButton />
        )}
      </div>
    </section>
  );
}

export default LeftSidebar;
