'use client'

import React, { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { DateRange } from 'react-day-picker'
import { DatePickerWithRange } from '@/components/ui/date-picker-range'

interface SubscriptionDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  actionButtonText?: React.ReactNode
  modalChildren?: React.ReactNode
}

export default function SubscriptionDataTable<TData, TValue>({
  columns,
  data,
}: SubscriptionDataTableProps<TData, TValue>) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 5, 20),
    to: new Date(),
  })
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(6)

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: dateRange,
      pagination: { pageIndex, pageSize },
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (!dateRange?.from || !dateRange?.to) return true
      const rowDate = new Date(row.getValue("transactionDate"))
      return rowDate >= dateRange.from && rowDate <= dateRange.to
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handlePreviousPage = () => {
    setPageIndex(Math.max(0, pageIndex - 1))
  }

  const handleNextPage = () => {
    setPageIndex(Math.min(table.getPageCount() - 1, pageIndex + 1))
  }

  const startPage = Math.max(0, pageIndex - 2)
  const endPage = Math.min(startPage + 5, table.getPageCount())

  return (
    <>
      <div className="flex justify-between">
        <div className="self-center font-bold px-2 py-6 text-[14px]">
          <span>Transactions</span>
          <br />
          <span>Recent transactions for subscription plan</span>
        </div>
        <div className="flex items-center py-6 gap-3">
          <DatePickerWithRange
            dateRange={dateRange}
            setDateRange={setDateRange}
            className="h-8 text-slate-500"
          />
        </div>
      </div>
      <div className="border-[1px] border-neutral-600 rounded-lg">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const headerClass =
                    header.column.id === 'accountname'
                      ? 'text-center text-[14px] min-w-[220px]'
                      : header.column.id === 'cards'
                      ? 'hidden md:table-cell text-center text-[14px]'
                      : header.column.id === 'lastlogin' ||
                        header.column.id === 'onboarded'
                      ? 'text-center text-[14px] min-w-[100px]'
                      : header.column.id === 'usertype' ||
                        header.column.id === 'subscription'
                      ? 'hidden sm:table-cell text-center text-[14px] min-w-[100px]'
                      : 'text-center text-[14px]'

                  return (
                    <TableHead key={header.id} className={headerClass}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.slice(0, pageSize).map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => {
                    const cellClass =
                      cell.column.id === 'accountname'
                        ? 'text-center text-[14px] min-w-[220px]'
                        : cell.column.id === 'cards'
                        ? 'hidden md:table-cell text-center text-[14px]'
                        : cell.column.id === 'lastlogin' || cell.column.id === 'onboarded'
                          ? 'text-center text-[14px] min-w-[100px]'
                        : cell.column.id === 'usertype' || cell.column.id === 'subscription'
                          ? 'hidden sm:table-cell text-center text-[14px] min-w-[100px]'
                          : 'text-center text-[14px]'

                    return (
                      <TableCell key={cell.id} className={cellClass}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center py-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem className="hover:cursor-pointer">
                <PaginationPrevious onClick={handlePreviousPage} disabled={pageIndex === 0} />
              </PaginationItem>
              {Array.from({ length: endPage - startPage }).map((_, i) => {
                const pageNum = startPage + i
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={pageNum === pageIndex}
                      onClick={() => setPageIndex(pageNum)}
                      className="h-8 w-8"
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              {endPage < table.getPageCount() && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem className="hover:cursor-pointer">
                <PaginationNext onClick={handleNextPage} disabled={pageIndex >= table.getPageCount() - 1} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  )
}
