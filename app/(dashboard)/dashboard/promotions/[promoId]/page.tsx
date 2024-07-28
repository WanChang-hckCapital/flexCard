import { authOptions } from "@/app/api/utils/authOptions";
import { getServerSession } from "next-auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchPromoById } from "@/lib/actions/admin.actions";
import Link from "next/link";
import AddNewPromotion from "@/components/forms/new-promotion";
import { redirect } from "next/navigation";

async function Page({ params }: { params: { promoId: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const promoDetails = await fetchPromoById(params.promoId);
  const preparedPromoDetails = {
    id: promoDetails._id,
    name: promoDetails.name,
    code: promoDetails.code,
    discount: promoDetails.discount,
    dateRange: {
      startDate: new Date(promoDetails.dateRange.startDate),
      endDate: new Date(promoDetails.dateRange.endDate),
    },
    limitedQuantity: promoDetails.limitedQuantity,
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-neutral-900 h-screen">
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
                <Link href="/dashboard/promotions">Prmotions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/promotionss/${preparedPromoDetails.id}`}>
                  Editing {preparedPromoDetails.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="bg-black border border-neutral-600 px-[25%] py-[4%] rounded-xl w-full self-center">
        <AddNewPromotion
          btnTitle="Update"
          authenticatedUserId={user.id}
          promoDetails={preparedPromoDetails}></AddNewPromotion>
      </div>
    </main>
  );
}

export default Page;
