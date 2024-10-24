"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

const labelMapping: { [key: string]: string } = {
  name: "Name",
  phone_number: "Phone Number",
  address: "Address",
  email_address: "Email",
  company_name: "Company Name",
  company_website: "Company Website",
  job_title: "Job Title",
};

const GptDataItem: React.FC<{
  label: string;
  value: string | number | object;
  onDelete: () => void;
}> = ({ label, value, onDelete }) => (
  <div className="flex items-start mt-4 space-x-3">
    <div className="flex-grow border border-gray-600 rounded-lg p-4 bg-gray-800">
      <Label className="block text-gray-300 mb-2">{label}:</Label>
      <Input
        defaultValue={
          typeof value === "object" ? JSON.stringify(value) : String(value)
        }
        className="w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
      />
    </div>
    <div className="flex-shrink-0">
      <AlertDialog>
        <AlertDialogTrigger>
          <Button
            variant="ghost"
            className="w-8 h-8 flex items-center justify-center p-0 text-red-500 hover:text-red-600 focus:ring-2 focus:ring-red-500"
          >
            <X />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this data? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
);

export default GptDataItem;
