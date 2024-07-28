import { authOptions } from "@/app/api/utils/authOptions";
import SubscriptionComponent from "@/components/admin/subscription/subscription-component";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { fetchUserSubscription } from "@/lib/actions/stripe.actions";
import {
  fetchMemberCardsLength,
  fetchProductPlanLimitedCardQuantity,
} from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from "react";
import SubscriptionDataTable from "./data-table";
import { columns } from "./columns";

async function Subscription() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authenticatedUserId = user.id;

  const subscriptionData = await fetchUserSubscription(user.id);

  if (!subscriptionData.success) {
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
                  <Link href="/dashboard/subscription">
                    Subscriptions & Payments
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {/* modify later */}
          <main className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 md:gap-4 lg:col-span-2 pl-6">
              <div className="flex">
                You have no Activated subscription yet&nbsp;
                <Link href="/product">
                  <p className="text-blue">Check out our plan here</p>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const productId = subscriptionData.subscription?.plan.id;
  const limitedCard = await fetchProductPlanLimitedCardQuantity(productId);
  const cardsCount = await fetchMemberCardsLength(authenticatedUserId);

  console.log("limitedCard", limitedCard);
  console.log("cardsCount", cardsCount);
  console.log("transaction", subscriptionData.subscription?.transaction);

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
                <Link href="/dashboard/subscription">
                  Subscriptions & Payments
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* need to fix here to show personal subscription(free version) */}
        <main className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 px-[6em]">
          <div className="grid auto-rows-max items-start gap-4 md:gap-4 lg:col-span-2">
            <SubscriptionComponent
              subscription={subscriptionData.subscription}
              limitedCard={limitedCard}
              cardsCount={cardsCount}
              authenticatedUserId={authenticatedUserId}
            />
            <Card>
              <CardContent>
                <SubscriptionDataTable
                  columns={columns}
                  data={subscriptionData.subscription?.transaction || []}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Subscription;
