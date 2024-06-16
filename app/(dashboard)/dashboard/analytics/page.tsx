import * as React from "react"
import Link from "next/link"
import {
    File,
    ListFilter,
    Plus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ChartCard } from "@/components/chart/chart-card"
import { TotalViewCardsByCardIdChart } from "@/components/chart/member-analysis-chart/total-card-views"
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions"
import { TotalViewProfileByDate } from "@/components/chart/member-analysis-chart/total-profile-views"
import { TotalFollowersByDate } from "@/components/chart/member-analysis-chart/total-follower-views"
import { redirect } from "next/navigation"

interface DashboardProps {
    searchParams: {
        cardId?: string
        viewDetailsCardRange?: string
        viewDetailsCardRangeFrom?: string
        viewDetailsCardRangeTo?: string
        profileViewDetailsRange?: string
        profileViewDetailsRangeFrom?: string
        profileViewDetailsRangeTo?: string
        followersByDateRange?: string
        followersByDateRangeFrom?: string
        followersByDateRangeTo?: string
    }
}

async function Dashboard({
    searchParams,
}: DashboardProps) {

    const session = await getServerSession(authOptions)
    const user = session?.user;

    if (!user) {
        redirect("/sign-in");
    }
    
    const authenticatedUserId = user.id;

    const viewDetailsCardRangeOption =
        getRangeOption(searchParams.viewDetailsCardRange, searchParams.viewDetailsCardRangeFrom, searchParams.viewDetailsCardRangeTo) ||
        RANGE_OPTIONS.last_7_days

    const profileViewDetailsRangeOption =
        getRangeOption(searchParams.profileViewDetailsRange, searchParams.profileViewDetailsRangeFrom, searchParams.profileViewDetailsRangeTo) ||
        RANGE_OPTIONS.last_7_days

    const followersByDateRangeOption =
        getRangeOption(searchParams.followersByDateRange, searchParams.followersByDateRangeFrom, searchParams.followersByDateRangeTo) ||
        RANGE_OPTIONS.last_7_days


    return (
        <div className="flex min-h-screen w-full flex-col bg-neutral-900 gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex flex-col sm:gap-4 max-md:px-4">
                <Breadcrumb className="hidden md:flex pb-3 px-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard/analytics">Analytics</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <main className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-4 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-slate-300">Total Create Card</CardDescription>
                                    <CardTitle className="text-[32px]">14</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-[12px] text-slate-300">
                                        +25% from last week
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Progress value={25} aria-label="25% increase" />
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-slate-300">Profile Views</CardDescription>
                                    <CardTitle className="text-[32px]">45</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-[12px] text-slate-300">
                                        +35% from last month
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Progress value={35} aria-label="35% increase" />
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-slate-300">Followers Increase</CardDescription>
                                    <CardTitle className="text-[32px]">6</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-[12px] text-slate-300">
                                        +55% from last week
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Progress value={55} aria-label="55% increase" />
                                </CardFooter>
                            </Card>
                        </div>
                        <div className="grid gap-4">
                            <ChartCard
                                title="Total Views"
                                queryKey="viewDetailsCardRange"
                                userId={authenticatedUserId}
                                type="card"
                                selectedRangeLabel={viewDetailsCardRangeOption.label}
                            >
                                <TotalViewCardsByCardIdChart cardId={searchParams.cardId || null} startDate={viewDetailsCardRangeOption.startDate} endDate={viewDetailsCardRangeOption.endDate} />
                            </ChartCard>
                            <ChartCard
                                title="Profile Views"
                                queryKey="profileViewDetailsRange"
                                userId={authenticatedUserId}
                                selectedRangeLabel={profileViewDetailsRangeOption.label}
                            >
                                <TotalViewProfileByDate userId={authenticatedUserId} startDate={profileViewDetailsRangeOption.startDate} endDate={profileViewDetailsRangeOption.endDate} />
                            </ChartCard>
                            <ChartCard
                                title="Total Followers"
                                queryKey="followersByDateRange"
                                userId={authenticatedUserId}
                                selectedRangeLabel={followersByDateRangeOption.label}
                            >
                                <TotalFollowersByDate userId={authenticatedUserId} startDate={followersByDateRangeOption.startDate} endDate={followersByDateRangeOption.endDate} />
                            </ChartCard>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Dashboard