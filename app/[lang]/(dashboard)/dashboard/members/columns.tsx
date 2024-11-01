"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export interface MembersListType {
  _id: string;
  accountname: string;
  image: string;
  usertype: string;
  cards: Array<any>;
  subscription: {
    estimatedEndDate: Date;
  };
  onboarded: boolean;
}

export const columns: ColumnDef<MembersListType>[] = [
  {
    accessorKey: "accountname",
    header: "Name",
    cell: ({ row }) => {
      const image = row.original.image;
      const accountname = row.original.accountname;

      if (image && accountname) {
        return (
          <div className="flex gap-2">
            <Image
              src={image}
              width={16}
              height={16}
              alt="Customer"
              className="w-10 h-10 rounded-full self-center"
            />
            <div className="text-center content-center w-full">
              <span>{accountname}</span>
            </div>
          </div>
        );
      } else {
        return <span className="text-muted-foreground">Not yet onboarded</span>;
      }
    },
  },
  {
    accessorKey: "usertype",
    header: "Role",
    cell: ({ row }) => {
      const usertype = row.getValue<string>("usertype").toUpperCase();

      switch (usertype) {
        case "FLEXADMIN":
          return <Badge variant="borderRed">{usertype}</Badge>;
        case "PERSONAL":
          return <Badge variant="borderPurple">{usertype}</Badge>;
        case "ORGANIZATION":
          return <Badge variant="borderBlue">{usertype}</Badge>;
        case "SUPERUSER":
          return <Badge variant="borderYellow">{usertype}</Badge>;
        default:
          return <Badge>{usertype}</Badge>;
      }
    },
  },
  {
    accessorKey: "cards",
    header: "Cards",
    cell: ({ row }) => {
      const cards = row.getValue<any[]>("cards");
      return <span className="text-muted-foreground">{cards.length}</span>;
    },
  },
  {
    accessorKey: "subscription",
    header: "End Date",
    cell: ({ row }) => {
      const subscription = row.getValue<{ estimatedEndDate?: Date }>(
        "subscription"
      );

      if (subscription?.estimatedEndDate) {
        const endDate = new Date(subscription.estimatedEndDate);
        return (
          <span className="text-muted-foreground">
            {endDate.toDateString()}
          </span>
        );
      } else {
        return <span className="text-muted-foreground">No subscription</span>;
      }
    },
  },
  {
    accessorKey: "onboarded",
    header: "Status",
    cell: ({ row }) => {
      const onboarded = row.getValue<boolean>("onboarded");
      return onboarded ? (
        <Badge variant="bgPurple">Onboarded</Badge>
      ) : (
        <Badge variant="bgRed">Onboarding</Badge>
      );
    },
  },
];

// export type fetchAllMemberFunction = (authenticatedUserId: string) => Promise<MembersListType[]>;
