"use client";

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Bell,
    Home,
    LineChart,
    Menu,
    Package,
    Package2,
    PiggyBank,
    Ticket,
    Search,
    Settings,
    ShoppingCart,
    Users2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { adminSidebarLinks } from "@/constants"
import { usePathname } from "next/navigation"
import { Session } from "next-auth";
import { UserImage } from "@/types";
import SignOutButton from "../buttons/signout-button";
import SignInButton from "../buttons/signin-button";

interface HeaderProps {
    session: Session | null;
    userInfoImage: UserImage | null;
}

function Header({ session, userInfoImage }: HeaderProps) {
    const user = session?.user;

    let userImage = null;
    if (userInfoImage != null) {
        userImage = userInfoImage.binaryCode.toString();
    } else {
        userImage = user?.image;
    }

    const pathname = usePathname();

    return (
        <header className="flex h-14 items-center gap-4 border-b border-neutral-600 bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="default" className="sm:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs bg-black">
                    <nav className="grid gap-6 text-lg font-medium">
                        {adminSidebarLinks.map((link) => {
                            const isActive =
                                (pathname.includes(link.route) && link.route.length > 10) ||
                                pathname === link.route;

                            // if (link.route === "/profile") link.route = `${link.route}/${userId}`;

                            return (
                                <Link
                                    href={link.route}
                                    key={link.label}
                                    className={`leftsidebar_link ${isActive && "bg-primary-500 "}`}
                                >
                                    {link.icon === 'Home' ? (
                                        <Home className="h-5 w-5" />
                                    ) : link.icon === 'ShoppingCart' ? (
                                        <ShoppingCart className="h-5 w-5" />
                                    ) : link.icon === 'Package' ? (
                                        <Package className="h-5 w-5" />
                                    ) :link.icon === 'Ticket' ? (
                                        <Ticket className="h-5 w-5" />
                                    ) : link.icon === 'Users' ? (
                                        <Users2 className="h-5 w-5" />
                                    ) : link.icon === 'LineChart' ? (
                                        <LineChart className="h-5 w-5" />
                                    ) : link.icon === 'PiggyBank' ? (
                                        <PiggyBank className="h-5 w-5" />
                                    ) : link.icon === 'Settings' ? (
                                        <Settings className="h-5 w-5" />
                                    ) : null}

                                    <p className='text-light-1'>{link.label}</p>
                                </Link>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>

            <div className="relative rounded-lg flex gap-1 bg-slate-800 w-full items-center h-10">
                <Search className="h-4 w-4 text-muted-foreground ml-3" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="searchbar_input"
                />
            </div>

            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 max-sm:hidden">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
            </Button>

            {
                session ?
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className='relative w-8 h-8 object-cover cursor-pointer'>
                                {userImage ? (
                                    <Image
                                        fill
                                        className="rounded-full object-cover"
                                        src={userImage}
                                        alt='icon heart' />
                                ) : (
                                    <p>{session.user.name?.split(' ')[0]}</p>
                                )}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black">
                            <DropdownMenuItem className='justify-center'>
                                <Link className='font-bold'
                                    href={`${session ? '/dashboard/settings' : 'api/auth/signin'}`}>
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className='justify-center'>
                                <Link className='font-bold'
                                    href={`${session ? '/' : 'api/auth/signin'}`}>
                                    flexCard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='flex text-left py-0 w-full'>
                                {
                                    session ? <SignOutButton /> : <SignInButton />
                                }
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> :
                    null
            }
        </header >
    )
}

export default Header