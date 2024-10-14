"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  forumsPerPage: number;
  totalForums: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

export default function Pagination({
  forumsPerPage,
  totalForums,
  paginate,
  currentPage,
}: PaginationProps) {
  const pageNumbers: number[] = [];

  for (let i = 1; i <= Math.ceil(totalForums / forumsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-6">
      <ul className="flex justify-center space-x-2">
        {pageNumbers.map((number) => (
          <li key={number}>
            <Button
              variant={currentPage === number ? "default" : "outline"}
              onClick={() => paginate(number)}
              className={cn(
                "px-3 py-1 rounded-md",
                currentPage === number && "bg-blue-600 text-white"
              )}
            >
              {number}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
