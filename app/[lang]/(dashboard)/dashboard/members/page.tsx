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
  fetchAllMemberProfile,
  fetchMemberProfileStats,
  fetchSubscriptionById,
} from "@/lib/actions/admin.actions";
import { fetchCurrentActiveProfileId, fetchMemberImage } from "@/lib/actions/user.actions";
import FilterDropdown from "@/components/buttons/filter-dropdown-button";
import { redirect } from "next/navigation";

function removeSymbols(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(removeSymbols); // Recursively clean arrays
  }

  // Create a new object excluding Symbol keys and values
  const cleanedObj: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key !== 'symbol' && typeof value !== 'symbol') {
      try {
        cleanedObj[key] = removeSymbols(value); // Recursively clean nested objects
      } catch (error) {
        console.error('Error processing key:', key, 'with value:', value);
      }
    }
  }

  return cleanedObj;
}

async function fetchAllSubscriptions(profiles: any[]) {
  const updatedProfiles = await Promise.all(
    profiles.map(async (profile) => {
      let userImages = [];

      // Process profile images
      if (Array.isArray(profile.image) && profile.image.length > 0) {
        userImages = await Promise.all(
          profile.image.map(async (imageId: any) => {
            const fetchedImage = await fetchMemberImage(imageId);
            const fetchedImageUrl = fetchedImage.binaryCode?.toString();

            // Ensure no symbols in fetchedImageUrl
            if (fetchedImageUrl) {
              try {
                return typeof fetchedImageUrl === 'object' && typeof fetchedImageUrl.toObject === 'function'
                  ? removeSymbols(fetchedImageUrl.toObject())
                  : fetchedImageUrl;
              } catch (error) {
                console.error('Error processing image:', fetchedImageUrl);
                return null;
              }
            }
            return null;
          })
        );

        profile.image = userImages.length > 0 ? userImages[0] : null;
      }

      // Process profile subscriptions
      if (profile.subscription.length > 0) {
        const lastSubscriptionId = profile.subscription[profile.subscription.length - 1];
        const subscriptionDetails = await fetchSubscriptionById(lastSubscriptionId);

        // Ensure no symbols in subscriptionDetails
        profile.subscription = subscriptionDetails && typeof subscriptionDetails.toJSON === 'function'
          ? removeSymbols(subscriptionDetails.toJSON())
          : removeSymbols(subscriptionDetails);
      }

      return removeSymbols(profile); // Ensure no symbols in the profile itself
    })
  );

  // Ensure no symbols in updatedProfiles
  return updatedProfiles.map((profile) => {
    try {
      return typeof profile.toObject === 'function' ? removeSymbols(profile.toObject()) : removeSymbols(profile);
    } catch (error) {
      console.error('Error converting profile to object:', profile);
      return profile;
    }
  });
}


async function Dashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);
  const strAuthActiveProfileId = authActiveProfileId.toString();

  let profiles = await fetchAllMemberProfile(authActiveProfileId);
  if (!profiles) return null;

  const memberProfileStats = await fetchMemberProfileStats();

  profiles = profiles.map((profile) => {
    let plainProfile = profile.toJSON ? profile.toJSON() : profile;
  
    return plainProfile;
  });

  const membersWithSubscriptions = await fetchAllSubscriptions(profiles);

  for (let member of membersWithSubscriptions) {
    for (let key in member) {
      if (typeof key === 'symbol' || typeof member[key] === 'symbol') {
        console.log('Found a symbol:', key, member[key]);
      }
    }
  }  

  const membersWithFreeVersion = membersWithSubscriptions.filter(profile =>
    (profile.usertype === "PERSONAL" || profile.usertype === "ORGANIZATION") &&
    (profile.subscription.length == 0));
  const membersWithProfessional = membersWithSubscriptions.filter(profile =>
    (profile.usertype === "PREMIUM" || profile.usertype === "EXPERT" || profile.usertype === "ELITE") &&
    (profile.subscription.length !== 0));
  const membersOrganization = membersWithSubscriptions.filter(profile =>
    (profile.usertype === "ORGANIZATION" || profile.usertype === "BUSINESS" || profile.usertype === "ENTERPRISE"));
  const membersAdmin = membersWithSubscriptions.filter(profile => profile.usertype === "FLEXADMIN");
  const membersSuperUser = membersWithSubscriptions.filter(profile => profile.usertype === "SUPERUSER");
  
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
                  <CardTitle className="text-[32px]">{memberProfileStats.general.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberProfileStats.general.isNew
                      ? 'New members this week'
                      : `+${memberProfileStats.general.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberProfileStats.general.increaseRate} aria-label={`${memberProfileStats.general.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">Professional Users</CardDescription>
                  <CardTitle className="text-[32px]">{memberProfileStats.professional.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberProfileStats.professional.isNew
                      ? 'New members this week'
                      : `+${memberProfileStats.professional.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberProfileStats.professional.increaseRate} aria-label={`${memberProfileStats.professional.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">Organizations</CardDescription>
                  <CardTitle className="text-[32px]">{memberProfileStats.organization.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberProfileStats.organization.isNew
                      ? 'New members this week'
                      : `+${memberProfileStats.organization.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberProfileStats.organization.increaseRate} aria-label={`${memberProfileStats.organization.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">Admins</CardDescription>
                  <CardTitle className="text-[32px]">{memberProfileStats.admin.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberProfileStats.admin.isNew
                      ? 'New members this week'
                      : `+${memberProfileStats.admin.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberProfileStats.admin.increaseRate} aria-label={`${memberProfileStats.admin.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">Super Users</CardDescription>
                  <CardTitle className="text-[32px]">{memberProfileStats.superuser.count}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    {memberProfileStats.superuser.isNew
                      ? 'New members this week'
                      : `+${memberProfileStats.superuser.increaseRate.toFixed(2)}% from last week`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={memberProfileStats.superuser.increaseRate} aria-label={`${memberProfileStats.superuser.increaseRate.toFixed(2)}% increase`} />
                </CardFooter>
              </Card>
            </div>
            <Tabs defaultValue="all">
              <div className="px-4 pb-2 text-[18px] font-bold">
                All Members ({profiles.length})
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
                      filterValue="accountname"
                      columns={columns}
                      data={membersWithSubscriptions}
                      authActiveProfileId={strAuthActiveProfileId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="general">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="accountname"
                      columns={columns}
                      data={membersWithFreeVersion}
                      authActiveProfileId={strAuthActiveProfileId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="professional">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="accountname"
                      columns={columns}
                      data={membersWithProfessional}
                      authActiveProfileId={strAuthActiveProfileId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="organization">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="accountname"
                      columns={columns}
                      data={membersOrganization}
                      authActiveProfileId={strAuthActiveProfileId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="admin">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="accountname"
                      columns={columns}
                      data={membersAdmin}
                      authActiveProfileId={strAuthActiveProfileId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="superuser">
                <Card>
                  <CardContent>
                    <MemberDataTable
                      filterValue="accountname"
                      columns={columns}
                      data={membersSuperUser}
                      authActiveProfileId={strAuthActiveProfileId}
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
