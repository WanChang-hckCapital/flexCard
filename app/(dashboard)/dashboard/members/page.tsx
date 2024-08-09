import * as React from "react";
import Link from "next/link";
import { File } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemberDataTable from "./data-table";
import { columns } from "./columns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import {
  fetchAllMember,
  fetchMemberStats,
  fetchSubscriptionById,
} from "@/lib/actions/admin.actions";
import { fetchMemberImage } from "@/lib/actions/user.actions";
import FilterDropdown from "@/components/buttons/filter-dropdown-button";
import { redirect } from "next/navigation";

async function fetchAllSubscriptions(members: any[]) {
  const updatedMembers = await Promise.all(
    members.map(async (member) => {
      let userImages = [];

      if (Array.isArray(member.image) && member.image.length > 0) {
        userImages = await Promise.all(
          member.image.map(async (imageId: any) => {
            const fetchedImage = await fetchMemberImage(imageId);
            const fetchedImageUrl = fetchedImage.binaryCode.toString();
            return fetchedImageUrl &&
              typeof fetchedImageUrl.toObject === "function"
              ? fetchedImageUrl.toObject()
              : fetchedImageUrl;
          })
        );

        let userImage = userImages.length > 0 ? userImages[0] : null;

        member.image = userImage;
      }

      if (member.subscription.length > 0) {
        const lastSubscriptionId =
          member.subscription[member.subscription.length - 1];
        const subscriptionDetails = await fetchSubscriptionById(
          lastSubscriptionId
        );
        member.subscription = subscriptionDetails.toJSON
          ? subscriptionDetails.toJSON()
          : subscriptionDetails;
        return { ...member };
      }

      return member;
    })
  );

  return updatedMembers.map((member) => {
    return typeof member.toObject === "function" ? member.toObject() : member;
  });
}

async function Dashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authenticatedUserId = user.id;

  let members = await fetchAllMember(authenticatedUserId);
  if (!members) return null;

  const memberStats = await fetchMemberStats();

  members = members.map((member) => (member.toJSON ? member.toJSON() : member));

  const membersWithSubscriptions = await fetchAllSubscriptions(members);
  const membersWithFreeVersion = membersWithSubscriptions.filter(member =>
    (member.usertype === "PERSONAL" || member.usertype === "ORGANIZATION") &&
    (member.subscription.length == 0));
  const membersWithProfessional = membersWithSubscriptions.filter(member =>
    (member.usertype === "PREMIUM" || member.usertype === "EXPERT" || member.usertype === "ELITE") &&
    (member.subscription.length !== 0));
  const membersOrganization = membersWithSubscriptions.filter(member =>
    (member.usertype === "ORGANIZATION" || member.usertype === "BUSINESS" || member.usertype === "ENTERPRISE"));
  const membersAdmin = membersWithSubscriptions.filter(member => member.usertype === "FLEXADMIN");
  const membersSuperUser = membersWithSubscriptions.filter(member => member.usertype === "SUPERUSER");

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
                <Link href="/dashboard/members">Members</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <main className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-4 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">General Members</CardDescription>
                  <CardTitle className="text-[32px]">{memberStats.general.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberStats.general.isNew
                      ? 'New members this week'
                      : `+${memberStats.general.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberStats.general.increaseRate} aria-label={`${memberStats.general.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">Professional Users</CardDescription>
                  <CardTitle className="text-[32px]">{memberStats.professional.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberStats.professional.isNew
                      ? 'New members this week'
                      : `+${memberStats.professional.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberStats.professional.increaseRate} aria-label={`${memberStats.professional.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">Organizations</CardDescription>
                  <CardTitle className="text-[32px]">{memberStats.organization.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberStats.organization.isNew
                      ? 'New members this week'
                      : `+${memberStats.organization.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberStats.organization.increaseRate} aria-label={`${memberStats.organization.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">Admins</CardDescription>
                  <CardTitle className="text-[32px]">{memberStats.admin.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberStats.admin.isNew
                      ? 'New members this week'
                      : `+${memberStats.admin.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberStats.admin.increaseRate} aria-label={`${memberStats.admin.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">Super Users</CardDescription>
                  <CardTitle className="text-[32px]">{memberStats.superuser.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberStats.superuser.isNew
                      ? 'New members this week'
                      : `+${memberStats.superuser.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberStats.superuser.increaseRate} aria-label={`${memberStats.superuser.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
            </div>
            <Tabs defaultValue="all">
              <div className="px-4 pb-2 text-[18px] font-bold">
                All Members ({members.length})
              </div>
              <div className="flex items-center">
                <TabsList className="text-[14px]">
                  <TabsTrigger value="all">View All</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="organization">Organization</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="superuser">Super User</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                  <FilterDropdown />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-[14px]"
                  >
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </div>
              </div>
              <TabsContent value="all">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="email"
                      columns={columns}
                      data={membersWithSubscriptions}
                      authenticatedUserId={authenticatedUserId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="general">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="email"
                      columns={columns}
                      data={membersWithFreeVersion}
                      authenticatedUserId={authenticatedUserId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="professional">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="email"
                      columns={columns}
                      data={membersWithProfessional}
                      authenticatedUserId={authenticatedUserId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="organization">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="email"
                      columns={columns}
                      data={membersOrganization}
                      authenticatedUserId={authenticatedUserId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="admin">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="email"
                      columns={columns}
                      data={membersAdmin}
                      authenticatedUserId={authenticatedUserId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="superuser">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="email"
                      columns={columns}
                      data={membersSuperUser}
                      authenticatedUserId={authenticatedUserId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard;
