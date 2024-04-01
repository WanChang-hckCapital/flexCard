"use client"

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { sidebarLinks } from "@/constants";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SignOutButton from "../signout-button";
import SignInButton from "../signin-button";

interface LeftSidebarProps {
  session: Session | null;
}

function LeftSidebar({ session }: LeftSidebarProps) {

  const router = useRouter();
  const pathname = usePathname();

  const userId = session?.user.id;

  return (
    // leftsidebar'>
    <section className='custom-scrollbar leftsidebar'>
      <div className='flex w-full flex-1 flex-col gap-6 px-6'>
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

              <p className='text-light-1 max-lg:hidden'>{link.label}</p>
            </Link>
          );
        })}
      </div>

      <div className='mt-10 px-6'>
        {
          session ? 
          <div className="text-center">
            {
              session?.user?.image ? (
              <Link className="leftsidebar_link" href={""}>
                <Image
                  width={28}
                  height={28}
                  className="rounded-full"
                  src={session.user.image}
                  alt='user image' />
                <p className='align-center text-light-1 max-lg:hidden'>{session.user.name?.split(' ')[0]}</p>
              </Link>
            ) : (
              <p className='align-center'>{session.user.name?.split(' ')[0]}</p>
            )}
          </div> : session ?
            <SignOutButton /> : <SignInButton />
        }
      </div>
    </section>
  );
};

export default LeftSidebar;
