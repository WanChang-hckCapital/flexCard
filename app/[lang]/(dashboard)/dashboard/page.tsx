import * as React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { ChartCard } from "@/components/chart/chart-card";
import { SubscriptionsByDayChart } from "@/components/chart/admin-analysis/subscription-day-chart";
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions";
import { MembersByDayChart } from "@/components/chart/admin-analysis/member-day-chart";
import { MembersCountryTypeChart } from "@/components/chart/admin-analysis/member-country-chart";
import { MembersTotalByTypeChart } from "@/components/chart/admin-analysis/member-totaltype-chart";
import { redirect } from "next/navigation";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import { fetchAllMember } from "@/lib/actions/admin.actions";
import { getDictionary } from "../../dictionaries";

interface DashboardProps {
  searchParams: {
    totalSubscriptionRange?: string;
    totalSubscriptionRangeFrom?: string;
    totalSubscriptionRangeTo?: string;
    newMembersRange?: string;
    newMembersRangeFrom?: string;
    newMembersRangeTo?: string;
    totalMembersRangeType?: string;
    totalMembersRangeTypeFrom?: string;
    totalMembersRangeTypeTo?: string;
  };
  params: {
    lang: string;
  };
}

async function Dashboard({ searchParams, params }: DashboardProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const dict = await getDictionary(params.lang);

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  const totalSubscriptionRangeOption =
    getRangeOption(
      searchParams.totalSubscriptionRange,
      searchParams.totalSubscriptionRangeFrom,
      searchParams.totalSubscriptionRangeTo
    ) || RANGE_OPTIONS.last_7_days;

  const newMembersRangeOption =
    getRangeOption(
      searchParams.newMembersRange,
      searchParams.newMembersRangeFrom,
      searchParams.newMembersRangeTo
    ) || RANGE_OPTIONS.last_7_days;

  const totalMembersRangeType =
    getRangeOption(
      searchParams.totalMembersRangeType,
      searchParams.totalMembersRangeTypeFrom,
      searchParams.totalMembersRangeTypeTo
    ) || RANGE_OPTIONS.last_7_days;

  let members = await fetchAllMember(authActiveProfileId);

  if (!members) return null;
  members = members.map((member) => (member.toJSON ? member.toJSON() : member));

  return (
    <div className="flex min-h-screen w-full flex-col dark:bg-neutral-900 bg-stone-200 gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col sm:gap-4 max-md:px-4">
        <Breadcrumb className="hidden md:flex pb-3 px-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">{dict.dashboard.breadcrumb.dashboard}</Link>
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
                  {/* <GenerateSPButton /> */}
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">{dict.dashboard.chart.analytics.thisWeek}</CardDescription>
                  <CardTitle className="text-[32px]">$1,329</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    +25% {dict.dashboard.chart.analytics.thisWeekDesc}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={25} aria-label="25% increase" />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">{dict.dashboard.chart.analytics.thisMonth}</CardDescription>
                  <CardTitle className="text-[32px]">$5,329</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    +10% {dict.dashboard.chart.analytics.thisMonthDesc}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={12} aria-label="12% increase" />
                </CardFooter>
              </Card>
            </div>
            <div className="grid gap-4">
              <ChartCard
                title={dict.dashboard.chart.totalSubscriptions}
                queryKey="totalSubscriptionRange"
                selectedRangeLabel={totalSubscriptionRangeOption.label}
              >
                <SubscriptionsByDayChart startDate={totalSubscriptionRangeOption.startDate} endDate={totalSubscriptionRangeOption.endDate} />
              </ChartCard>
              <ChartCard
                title={dict.dashboard.chart.newMembers}
                queryKey="newMembersRange"
                selectedRangeLabel={newMembersRangeOption.label}
              >
                <MembersByDayChart startDate={newMembersRangeOption.startDate} endDate={newMembersRangeOption.endDate} />
              </ChartCard>
              <ChartCard
                title={dict.dashboard.chart.totalMembers}
                queryKey="totalMembersRangeType"
                selectedRangeLabel={totalMembersRangeType.label}
              >
                <MembersTotalByTypeChart startDate={totalMembersRangeType.startDate} endDate={totalMembersRangeType.endDate} />
              </ChartCard>
              <ChartCard
                title={dict.dashboard.chart.analyticsCountry}
              >
                <MembersCountryTypeChart members={members} />
              </ChartCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
