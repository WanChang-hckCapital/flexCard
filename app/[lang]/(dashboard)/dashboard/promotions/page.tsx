import { authOptions } from "@/app/api/utils/authOptions";
import DeleteConfirmationButton from "@/components/buttons/delete-confirmation-button";
import NavigateRouteButton from "@/components/buttons/navigate-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchAllPromotion } from "@/lib/actions/admin.actions";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import { format } from "date-fns";
import { Delete, PackageOpen, Pencil } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from "react";

async function Products() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  const promotions = await fetchAllPromotion();

  const mainClassName =
    promotions.data && promotions.data.length > 5
      ? "flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-neutral-900"
      : "flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-neutral-900 h-screen";

  return (
    <main className={mainClassName}>
      <div className="flex items-center">
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
                <Link href="/dashboard/promotions">Promotions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {promotions.data && promotions.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promotions.data.map((promotion, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-4 bg-black border border-neutral-600 rounded-lg">
              <div className="flex row justify-between">
                <h3 className="text-lg font-bold">{promotion.name}</h3>
                <Link href={`/dashboard/promotions/${promotion.id}`}>
                  <Pencil className="w-5 h-5" />
                </Link>
                <DeleteConfirmationButton
                  promoId={promotion.id}
                  authActiveProfileId={authActiveProfileId}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">
                  Promo Code: {promotion.code}
                </span>
                <span className="text-sm text-slate-300">
                  Discount Rate: {promotion.discount}
                </span>
                <span className="text-sm text-slate-300">
                  Start Date:{" "}
                  {format(new Date(promotion.dateRange.startDate), "PPP")}
                </span>
                <span className="text-sm text-slate-300">
                  End Date:{" "}
                  {format(new Date(promotion.dateRange.endDate), "PPP")}
                </span>
                <span className="text-sm text-slate-300">
                  Available Pax: {promotion.limitedQuantity}
                </span>
                <span className="text-sm text-slate-300">
                  Pax Remain: {promotion.limitedQuantity}
                </span>
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-4 p-4 bg-black border border-neutral-600 rounded-lg text-center justify-center">
            <h3 className="text-lg font-bold">New Promotion</h3>
            <p className="text-sm text-slate-300">
              Add some new promotion here.
            </p>
            <NavigateRouteButton
              url={"/dashboard/promotions/add-new-promotions"}
              btnName={"Add New Promotion"}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-neutral-600 shadow-sm bg-black p-[16%]">
          <div className="flex flex-col items-center gap-1 text-center">
            <PackageOpen className="w-24 h-24 max-sm:hidden" />
            <h3 className="max-sm:text-[21px] max-md:text-[26px] lg:text-[32px] font-bold tracking-tight">
              You have no promotions
            </h3>
            <p className="text-sm text-slate-300">
              You can start celebrate event as soon as you add a promotion.
            </p>
            <NavigateRouteButton
              url={"/dashboard/promotions/add-new-promotions"}
              btnName={"Add New Promotion"}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default Products;
