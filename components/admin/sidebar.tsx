"use client"

import Link from "next/link"
import {
    Bell,
    Home,
    LineChart,
    Package,
    Package2,
    ShoppingCart,
    Users,
    PiggyBank,
    Ticket,
    Settings,
    MailCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { adminSidebarLinks, NormalUserAllowedRoutes } from "@/constants"
import { usePathname } from "next/navigation"
import { Usertype } from "@/types"

interface UserTypeProps {
    usertype: Usertype;
    dict: any;
}

function SideBar({ usertype, dict }: UserTypeProps) {
    const pathname = usePathname();
    const userAllowedRoutes = NormalUserAllowedRoutes[usertype];

    const filteredLinks = adminSidebarLinks.filter(link =>
        userAllowedRoutes.includes(link.route)
    );

    return (
        <div className="hidden h-full border-r border-neutral-600 dark:bg-dark-1 bg-stone-400 md:block">
            <div className="flex h-[80%] flex-col gap-2">
                <div className="flex h-14 items-center border-b border-neutral-600 px-4 lg:h-[60px] lg:px-6">
                    <Link href="/dashboard">
                        <span className='head-text font-bold'>flxBubble</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {filteredLinks.map(link => {
                            const isActive =
                                (pathname.includes(link.route) && link.route.length > 10) ||
                                pathname === link.route;

                            return (
                                <Link
                                    href={link.route}
                                    key={link.label}
                                    className={`leftsidebar_link ${isActive && "dark:bg-primary-500 bg-stone-600"}`}
                                >
                                    {link.icon === "Home" && <Home className="h-5 w-5 text-white" />}
                                    {link.icon === "ShoppingCart" && (
                                        <ShoppingCart className="h-5 w-5" />
                                    )}
                                    {link.icon === "Package" && <Package className="h-5 w-5 text-white" />}
                                    {link.icon === "Ticket" && <Ticket className="h-5 w-5 text-white" />}
                                    {link.icon === "Users" && <Users className="h-5 w-5 text-white" />}
                                    {link.icon === "LineChart" && <LineChart className="h-5 w-5 text-white" />}
                                    {link.icon === "PiggyBank" && <PiggyBank className="h-5 w-5 text-white" />}
                                    {link.icon === "MailCheck" && <MailCheck className="h-5 w-5 text-white" />}
                                    {link.icon === "Settings" && <Settings className="h-5 w-5 text-white" />}
                                    <p className="text-light-1">{link.label}</p>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
            <div className="mt-auto p-4 sticky bottom-0">
                <Card x-chunk="dashboard-02-chunk-0">
                    <CardHeader className="p-2 pt-0 md:p-4">
                        <CardTitle>Upgrade to Pro</CardTitle>
                        <CardDescription>
                            Unlock all features and get unlimited access to our support
                            team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                        <Button size="sm" className="w-full">
                            Upgrade
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default SideBar
