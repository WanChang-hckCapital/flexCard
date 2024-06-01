
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AddNewPromotion from "@/components/forms/new-promotion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

async function Page() {

  const session = await getServerSession(authOptions)
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

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
                <Link href="/dashboard/promotions">Promotions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/products/add-new-promotions">Add New Promotions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="bg-black border border-neutral-600 px-[25%] py-[4%] rounded-xl w-full self-center">
        <AddNewPromotion btnTitle="Add" authenticatedUserId={user.id}></AddNewPromotion>
      </div>
    </main>
  );
}

export default Page;