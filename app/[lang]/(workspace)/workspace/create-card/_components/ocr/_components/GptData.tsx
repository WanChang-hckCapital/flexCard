"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import GptDateItem from "./GptDataItem";

interface GptDataProps {
  gptData: Record<string, any>;
  isGptDataLoading: boolean;
}

const labelMapping: { [key: string]: string } = {
  name: "Name",
  phone_number: "Phone Number",
  address: "Address",
  email_address: "Email",
  company_name: "Company Name",
  company_website: "Company Website",
  job_title: "Job Title",
};

const GptData: React.FC<GptDataProps> = ({ gptData, isGptDataLoading }) => {
  if (isGptDataLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    );
  }

  return (
    <div>
      {gptData &&
        Object.entries(gptData).map(([key, value]) => {
          if (key === "logo" || key === "logo_detected") return null;

          const displayKey = labelMapping[key] || key.replace(/_/g, " ");

          return (
            <GptDateItem
              key={key}
              label={displayKey}
              value={value.text} // only text is pass in
              onDelete={() => console.log(`Deleting ${displayKey}`)}
            />
          );
        })}
    </div>
  );
};

export default GptData;
