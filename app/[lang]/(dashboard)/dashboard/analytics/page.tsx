import * as React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
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
import { TotalViewCardsByCardIdChart } from "@/components/chart/member-analysis-chart/total-card-views";
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions";
import { TotalViewProfileByDate } from "@/components/chart/member-analysis-chart/total-profile-views";
import { TotalFollowersByDate } from "@/components/chart/member-analysis-chart/total-follower-views";
import { redirect } from "next/navigation";
import { fetchCurrentActiveProfileId, fetchDashboardData } from "@/lib/actions/user.actions";

interface DashboardProps {
  searchParams: {
    cardId?: string;
    viewDetailsCardRange?: string;
    viewDetailsCardRangeFrom?: string;
    viewDetailsCardRangeTo?: string;
    profileViewDetailsRange?: string;
    profileViewDetailsRangeFrom?: string;
    profileViewDetailsRangeTo?: string;
    followersByDateRange?: string;
    followersByDateRangeFrom?: string;
    followersByDateRangeTo?: string;
  };
}

async function Dashboard({ searchParams }: DashboardProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  const viewDetailsCardRangeOption =
    getRangeOption(
      searchParams.viewDetailsCardRange,
      searchParams.viewDetailsCardRangeFrom,
      searchParams.viewDetailsCardRangeTo
    ) || RANGE_OPTIONS.last_7_days;

  const profileViewDetailsRangeOption =
    getRangeOption(
      searchParams.profileViewDetailsRange,
      searchParams.profileViewDetailsRangeFrom,
      searchParams.profileViewDetailsRangeTo
    ) || RANGE_OPTIONS.last_7_days;

  const followersByDateRangeOption =
    getRangeOption(
      searchParams.followersByDateRange,
      searchParams.followersByDateRangeFrom,
      searchParams.followersByDateRangeTo
    ) || RANGE_OPTIONS.last_7_days;

  const dashboardData = await fetchDashboardData({
    profileId: authActiveProfileId,
  });

  return (
    <div className="flex min-h-screen w-full flex-col dark:bg-neutral-900 bg-stone-200 gap-4 p-4 lg:gap-6 lg:p-6">
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
              <Card className="bg-stone-500">
                <CardHeader className="pb-2">
                  <CardDescription className="dark:text-slate-300 text-white">
                    Total Create Card
                  </CardDescription>
                  <CardTitle className="text-[32px] dark:text-black text-white">
                    {dashboardData.memberCardQuantity}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] dark:text-slate-300 text-white">
                    +{dashboardData.cardsLastWeek}% from last week
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    value={
                      (dashboardData.cardsLastWeek /
                        dashboardData.memberCardQuantity) *
                      100
                    }
                    aria-label={`${dashboardData.cardsLastWeek}% increase`}
                  />
                </CardFooter>
              </Card>
              <Card className="bg-stone-500">
                <CardHeader className="pb-2">
                  <CardDescription className="dark:text-slate-300 text-white">
                    Profile Views
                  </CardDescription>
                  <CardTitle className="text-[32px] dark:text-black text-white">
                    {dashboardData.profileViews}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] dark:text-slate-300 text-white">
                    +{dashboardData.profileViewsLastWeek}% from last week
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    value={
                      (dashboardData.profileViewsLastWeek /
                        dashboardData.profileViews) *
                      100
                    }
                    aria-label={`${dashboardData.profileViewsLastWeek}% increase`}
                  />
                </CardFooter>
              </Card>
              <Card className="bg-stone-500">
                <CardHeader className="pb-2">
                  <CardDescription className="dark:text-slate-300 text-white">
                    Followers Increase
                  </CardDescription>
                  <CardTitle className="text-[32px] dark:text-black text-white">
                    {dashboardData.followersIncrease}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] dark:text-slate-300 text-white">
                    +{dashboardData.totalFollowersLastWeek}% from last week
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    value={
                      (dashboardData.totalFollowersLastWeek /
                        dashboardData.followersIncrease) *
                      100
                    }
                    aria-label={`${dashboardData.totalFollowersLastWeek}% increase`}
                  />
                </CardFooter>
              </Card>
            </div>
            <div className="grid gap-4">
              <ChartCard
                title="Total Views"
                queryKey="viewDetailsCardRange"
                profileId={authActiveProfileId}
                type="card"
                selectedRangeLabel={viewDetailsCardRangeOption.label}>
                <TotalViewCardsByCardIdChart
                  cardId={searchParams.cardId || null}
                  startDate={viewDetailsCardRangeOption.startDate}
                  endDate={viewDetailsCardRangeOption.endDate}
                />
              </ChartCard>
              <ChartCard
                title="Profile Views"
                queryKey="profileViewDetailsRange"
                profileId={authActiveProfileId}
                selectedRangeLabel={profileViewDetailsRangeOption.label}>
                <TotalViewProfileByDate
                  profileId={authActiveProfileId}
                  startDate={profileViewDetailsRangeOption.startDate}
                  endDate={profileViewDetailsRangeOption.endDate}
                />
              </ChartCard>
              <ChartCard
                title="Total Followers"
                queryKey="followersByDateRange"
                profileId={authActiveProfileId}
                selectedRangeLabel={followersByDateRangeOption.label}>
                <TotalFollowersByDate
                  profileId={authActiveProfileId}
                  startDate={followersByDateRangeOption.startDate}
                  endDate={followersByDateRangeOption.endDate}
                />
              </ChartCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
