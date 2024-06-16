import * as React from "react"
import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import GenerateSPButton from "@/components/buttons/generate-subscription"
import { fetchAllMember } from "@/lib/actions/admin.actions"
import { ChartCard } from "@/components/chart/chart-card"
import { SubscriptionsByDayChart } from "@/components/chart/admin-analysis/subscription-day-chart"
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions"
import { MembersByDayChart } from "@/components/chart/admin-analysis/member-day-chart"
import { MembersCountryTypeChart } from "@/components/chart/admin-analysis/member-country-chart"
import { MembersTotalByTypeChart } from "@/components/chart/admin-analysis/member-totaltype-chart"
import { redirect } from "next/navigation"

interface DashboardProps {
    searchParams: {
        totalSubscriptionRange?: string
        totalSubscriptionRangeFrom?: string
        totalSubscriptionRangeTo?: string
        newMembersRange?: string
        newMembersRangeFrom?: string
        newMembersRangeTo?: string
        totalMembersRangeType?: string
        totalMembersRangeTypeFrom?: string
        totalMembersRangeTypeTo?: string
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

    const totalSubscriptionRangeOption =
        getRangeOption(searchParams.totalSubscriptionRange, searchParams.totalSubscriptionRangeFrom, searchParams.totalSubscriptionRangeTo) ||
        RANGE_OPTIONS.last_7_days

    const newMembersRangeOption =
        getRangeOption(searchParams.newMembersRange, searchParams.newMembersRangeFrom, searchParams.newMembersRangeTo) ||
        RANGE_OPTIONS.last_7_days

    const totalMembersRangeType =
        getRangeOption(searchParams.totalMembersRangeType, searchParams.totalMembersRangeTypeFrom, searchParams.totalMembersRangeTypeTo) ||
        RANGE_OPTIONS.last_7_days

    let members = await fetchAllMember(authenticatedUserId);

    if (!members) return null;
    members = members.map(member => member.toJSON ? member.toJSON() : member);

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
                    </BreadcrumbList>
                </Breadcrumb>
                <main className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-4 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            <Card
                                className="sm:col-span-2"
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle>Super Account</CardTitle>
                                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                                        Create New SuperType Account for User, free to use, hold for life.
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <GenerateSPButton />
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-slate-300">This Week</CardDescription>
                                    <CardTitle className="text-[32px]">$1,329</CardTitle>
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
                                    <CardDescription className="text-slate-300">This Month</CardDescription>
                                    <CardTitle className="text-[32px]">$5,329</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-[12px] text-slate-300">
                                        +10% from last month
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Progress value={12} aria-label="12% increase" />
                                </CardFooter>
                            </Card>
                        </div>
                        <div className="grid gap-4">
                            <ChartCard
                                title="Total Subscriptions"
                                queryKey="totalSubscriptionRange"
                                selectedRangeLabel={totalSubscriptionRangeOption.label}
                            >
                                <SubscriptionsByDayChart startDate={totalSubscriptionRangeOption.startDate} endDate={totalSubscriptionRangeOption.endDate} />
                            </ChartCard>
                            <ChartCard
                                title="New Members"
                                queryKey="newMembersRange"
                                selectedRangeLabel={newMembersRangeOption.label}
                            >
                                <MembersByDayChart startDate={newMembersRangeOption.startDate} endDate={newMembersRangeOption.endDate} />
                            </ChartCard>
                            <ChartCard
                                title="Total Members"
                                queryKey="totalMembersRangeType"
                                selectedRangeLabel={totalMembersRangeType.label}
                            >
                                <MembersTotalByTypeChart startDate={totalMembersRangeType.startDate} endDate={totalMembersRangeType.endDate} />
                            </ChartCard>
                            <ChartCard
                                title="Anaylsis by Country"
                            >
                                <MembersCountryTypeChart members={members} />
                            </ChartCard>
                        </div>
                    </div>
                    {/* <div>
                        <Card
                            className="overflow-hidden" x-chunk="dashboard-05-chunk-4"
                        >
                            <CardHeader className="flex flex-row items-start bg-muted/50">
                                <div className="grid gap-0.5">
                                    <CardTitle className="group flex items-center gap-2 text-lg">
                                        Order Oe31b70H
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <Copy className="h-3 w-3" />
                                            <span className="sr-only">Copy Order ID</span>
                                        </Button>
                                    </CardTitle>
                                    <CardDescription>Date: November 23, 2023</CardDescription>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    <Button size="sm" variant="outline" className="h-8 gap-1">
                                        <Truck className="h-3.5 w-3.5" />
                                        <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                                            Track Order
                                        </span>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="outline" className="h-8 w-8">
                                                <MoreVertical className="h-3.5 w-3.5" />
                                                <span className="sr-only">More</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Export</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Trash</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 text-sm">
                                <div className="grid gap-3">
                                    <div className="font-semibold">Order Details</div>
                                    <ul className="grid gap-3">
                                        <li className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Glimmer Lamps x <span>2</span>
                                            </span>
                                            <span>$250.00</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Aqua Filters x <span>1</span>
                                            </span>
                                            <span>$49.00</span>
                                        </li>
                                    </ul>
                                    <Separator className="my-2" />
                                    <ul className="grid gap-3">
                                        <li className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>$299.00</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>$5.00</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span>$25.00</span>
                                        </li>
                                        <li className="flex items-center justify-between font-semibold">
                                            <span className="text-muted-foreground">Total</span>
                                            <span>$329.00</span>
                                        </li>
                                    </ul>
                                </div>
                                <Separator className="my-4" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-3">
                                        <div className="font-semibold">Shipping Information</div>
                                        <address className="grid gap-0.5 not-italic text-muted-foreground">
                                            <span>Liam Johnson</span>
                                            <span>1234 Main St.</span>
                                            <span>Anytown, CA 12345</span>
                                        </address>
                                    </div>
                                    <div className="grid auto-rows-max gap-3">
                                        <div className="font-semibold">Billing Information</div>
                                        <div className="text-muted-foreground">
                                            Same as shipping address
                                        </div>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="grid gap-3">
                                    <div className="font-semibold">Customer Information</div>
                                    <dl className="grid gap-3">
                                        <div className="flex items-center justify-between">
                                            <dt className="text-muted-foreground">Customer</dt>
                                            <dd>Liam Johnson</dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt className="text-muted-foreground">Email</dt>
                                            <dd>
                                                <a href="mailto:">liam@acme.com</a>
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt className="text-muted-foreground">Phone</dt>
                                            <dd>
                                                <a href="tel:">+1 234 567 890</a>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                                <Separator className="my-4" />
                                <div className="grid gap-3">
                                    <div className="font-semibold">Payment Information</div>
                                    <dl className="grid gap-3">
                                        <div className="flex items-center justify-between">
                                            <dt className="flex items-center gap-1 text-muted-foreground">
                                                <CreditCard className="h-4 w-4" />
                                                Visa
                                            </dt>
                                            <dd>**** **** **** 4532</dd>
                                        </div>
                                    </dl>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Updated <time dateTime="2023-11-23">November 23, 2023</time>
                                </div>
                                <Pagination className="ml-auto mr-0 w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <Button size="icon" variant="outline" className="h-6 w-6">
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                                <span className="sr-only">Previous Order</span>
                                            </Button>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <Button size="icon" variant="outline" className="h-6 w-6">
                                                <ChevronRight className="h-3.5 w-3.5" />
                                                <span className="sr-only">Next Order</span>
                                            </Button>
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </CardFooter>
                        </Card>
                    </div> */}
                </main>
            </div>
        </div>
    )
}

export default Dashboard