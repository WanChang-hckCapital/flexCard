"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchOnlyCardId } from "@/lib/actions/user.actions"
import { RANGE_OPTIONS } from "@/lib/rangeOptions"
import { subDays } from "date-fns"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { DateRange } from "react-day-picker"

type ChartCardProps = {
  title: string
  queryKey?: string
  selectedRangeLabel?: string
  userId?: string
  type?: string
  children: ReactNode
}

export function ChartCard({
  title,
  children,
  queryKey,
  userId,
  type,
  selectedRangeLabel,
}: ChartCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [cardDetails, setCardDetails] = useState<any>([]);
  const [selectedCard, setSelectedCard] = useState<{ _id: string; title: string } | null>(null);

  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        const response = await fetchOnlyCardId(userId);
        setCardDetails(response);
      }

      fetchData();
    }
  }, [userId]);


  function setRange(range: keyof typeof RANGE_OPTIONS | DateRange) {
    const params = new URLSearchParams(searchParams.toString())
    if (typeof range === "string") {
      params.set(queryKey || "", range)
      params.delete(`${queryKey}From`)
      params.delete(`${queryKey}To`)
    } else {
      if (range.from == null || range.to == null) return
      params.delete(queryKey || "")
      params.set(`${queryKey}From`, range.from.toISOString())
      params.set(`${queryKey}To`, range.to.toISOString())
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleCardSelection(cardId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cardId", cardId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    const card = cardDetails.find((card: { _id: string }) => card._id === cardId);
    setSelectedCard(card);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            {(userId !== undefined && cardDetails && type === "card") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {selectedCard ? selectedCard.title : "Select Card"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {cardDetails.map((card: any) => (
                    <DropdownMenuItem
                      key={card._id}
                      onClick={() => handleCardSelection(card._id)}
                      disabled={card._id === searchParams.get("cardId")}
                      className="truncate"
                    >
                      {card.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {queryKey !== undefined && selectedRangeLabel !== undefined && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{selectedRangeLabel}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(RANGE_OPTIONS).map(([key, value]) => (
                    <DropdownMenuItem 
                      onClick={() => setRange(key as keyof typeof RANGE_OPTIONS)}
                      key={key}
                      disabled={key === searchParams.get(queryKey)}
                      className="truncate"
                    >
                      {value.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Custom</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <div>
                        <Calendar
                          mode="range"
                          disabled={{ after: new Date() }}
                          selected={dateRange}
                          defaultMonth={dateRange?.from}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                        <DropdownMenuItem className="hover:bg-auto">
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (dateRange == null) return
                              setRange(dateRange)
                            }}
                            disabled={dateRange == null}
                            className="w-full"
                          >
                            Submit
                          </Button>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
