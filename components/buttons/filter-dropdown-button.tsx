"use client";

import React, { useState } from 'react';
import { ListFilter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const FilterDropdown = () => {
  const [selectedFilter, setSelectedFilter] = useState('email');

  const handleFilterChange = (filter:any) => {
    setSelectedFilter((prevFilter) => prevFilter === filter ? '' : filter);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-sm">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only text-[14px]">Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black">
        <DropdownMenuLabel className="text-center text-[14px]">Filter by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedFilter === 'email'}
          onCheckedChange={() => handleFilterChange('email')}
        >
          Email
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedFilter === 'login'}
          onCheckedChange={() => handleFilterChange('login')}
        >
          Login
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedFilter === 'status'}
          onCheckedChange={() => handleFilterChange('status')}
        >
          Status
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
