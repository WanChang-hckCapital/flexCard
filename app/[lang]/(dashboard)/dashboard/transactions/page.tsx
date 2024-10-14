import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/utils/authOptions";
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
import { fetchTransactionStats } from "@/lib/actions/admin.actions";
import { ChartCard } from "@/components/chart/chart-card";
import { TransactionAnalysisByDate } from "@/components/chart/transaction-analysis/transaction-chart";
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions";
import CheckoutForm from "@/components/forms/checkout";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";

interface TransactionsDashboardProps {
  searchParams: {
    transactionDetailsByDateRange?: string;
    transactionDetailsRangeFrom?: string;
    transactionDetailsRangeTo?: string;
  };
}

async function Transactions({ searchParams }: TransactionsDashboardProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  const transactionDetailsRangeOption =
    getRangeOption(
      searchParams.transactionDetailsByDateRange,
      searchParams.transactionDetailsRangeFrom,
      searchParams.transactionDetailsRangeTo
    ) || RANGE_OPTIONS.last_7_days;

  const transactionStats = await fetchTransactionStats(
    authActiveProfileId,
    transactionDetailsRangeOption.startDate,
    transactionDetailsRangeOption.endDate
  );

  const totalTransactions = transactionStats.totalTransactions ?? 0;
  const totalFees = transactionStats.totalFees ?? 0;
  const transactionIncreaseRate = transactionStats.transactionIncreaseRate ?? 0;
  const feeIncreaseRate = transactionStats.feeIncreaseRate ?? 0;

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
                <Link href="/dashboard/transactions">Transactions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <main className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-4 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">
                    Total Transactions
                  </CardDescription>
                  <CardTitle className="text-[32px]">
                    {totalTransactions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    +{transactionIncreaseRate}% from last week
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    value={transactionIncreaseRate}
                    aria-label={`${transactionIncreaseRate}% increase`}
                  />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-300">
                    Total Fees
                  </CardDescription>
                  <CardTitle className="text-[32px]">
                    ${totalFees.toFixed(2)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[12px] text-slate-300">
                    +{feeIncreaseRate}% from last week
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    value={feeIncreaseRate}
                    aria-label={`${feeIncreaseRate}% increase`}
                  />
                </CardFooter>
              </Card>
              {/* <Card
                                className="sm:col-span-2"
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle>Super Account</CardTitle>
                                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                                        Create New SuperType Account for User, free to use, hold for life.
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <CheckoutForm />
                                </CardFooter>
                            </Card> */}
            </div>
            <div className="grid gap-4">
              <ChartCard
                title="Transactions Over Time"
                queryKey="transactionDetailsByDateRange"
                profileId={authActiveProfileId}
                selectedRangeLabel={transactionDetailsRangeOption.label}>
                <TransactionAnalysisByDate
                  profileId={authActiveProfileId}
                  startDate={transactionDetailsRangeOption.startDate}
                  endDate={transactionDetailsRangeOption.endDate}
                />
              </ChartCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Transactions;
