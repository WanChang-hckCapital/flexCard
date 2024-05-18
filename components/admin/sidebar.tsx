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
import { adminSidebarLinks } from "@/constants"
import { usePathname } from "next/navigation"

function SideBar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r border-neutral-600 bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b border-neutral-600 px-4 lg:h-[60px] lg:px-6">
                    <Link href="/dashboard">
                        <span className='head-text font-bold'>flexCard</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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
                                        <Users className="h-5 w-5" />
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
                </div>
                <div className="mt-auto p-4">
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
        </div>
        //         {/* <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        //   <div className="flex items-center">
        //     <h1 className="text-lg font-semibold md:text-2xl">Inventory</h1>
        //   </div>
        //   <div
        //     className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        //   >
        //     <div className="flex flex-col items-center gap-1 text-center">
        //       <h3 className="text-2xl font-bold tracking-tight">
        //         You have no products
        //       </h3>
        //       <p className="text-sm text-muted-foreground">
        //         You can start selling as soon as you add a product.
        //       </p>
        //       <Button className="mt-4">Add Product</Button>
        //     </div>
        //   </div>
        // </main> */}
    )
}

export default SideBar
