// 'use client'
// import { Badge } from '@/components/ui/badge'
// import { MembersListType } from '@/types'
// import { ColumnDef } from '@tanstack/react-table'

// export const columns: ColumnDef<MembersListType>[] = [
//   {
//     accessorKey: 'accountname',
//     header: 'Customer',
//     cell: ({ row }) => {
//       return (
//         <div>
//           <span>{row.getValue('accountname')}</span>
//           <span>{row.getValue('email')}</span>
//         </div>
          
//       )
//     },
//   },
//   {
//     accessorKey: 'usertype',
//     header: 'Type',
//     cell: ({ row }) => {
//       return (
//         <span className="text-muted-foreground">{row.getValue('usertype')}</span>
//       )
//     },
//   },
//   {
//     accessorKey: 'cards',
//     header: 'Cards',
//     cell: ({ row }) => {
//       const cardsQuantity = row.getValue('cards').length
//       return (
//         <span className="text-muted-foreground">{cardsQuantity}</span>
//       )

//       // return status ? (
//       //   <Badge variant={'default'}>Live - {row.original.subDomainName}</Badge>
//       // ) : (
//       //   <Badge variant={'secondary'}>Draft</Badge>
//       // )
//     },
//   },
//   {
//     accessorKey: 'estimatedEndDate',
//     header: 'End Date',
//     cell: ({ row }) => {
//       const date = ` ${row.getValue('subcription').estimatedEndDate.toDateString()} ${row.getValue('subcription').estimatedEndDate.toLocaleTimeString()} `
//       return <span className="text-muted-foreground">{date}</span>
//     },
//   },
//   {
//     accessorKey: 'lastLogin',
//     header: 'Login',
//     cell: ({ row }) => {
//       const date = ` ${row.getValue('lastLogin').toDateString()} ${row.getValue('lastLogin').toLocaleTimeString()} `
//       return <span className="text-muted-foreground">{date}</span>
//     },
//   },
// ]

"use client";

import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

export interface MembersListType {
    accountname: string;
    email: string;
    usertype: string;
    cards: Array<any>;
    subscription: {
        estimatedEndDate: Date;
    };
    lastLogin: Date;
}

export const columns: ColumnDef<MembersListType>[] = [
    {
        accessorKey: 'email',
        header: 'Customer',
        cell: ({ row }) => (
            <div>
                <span className="text-muted-foreground">{row.getValue('email')}</span>
            </div>
        ),
    },
    {
        accessorKey: 'usertype',
        header: 'Type',
        cell: ({ row }) => (
            <span className="text-muted-foreground">{row.getValue('usertype')}</span>
        ),
    },
    {
        accessorKey: 'cards',
        header: 'Cards',
        cell: ({ row }) => {
            const cards: any = row.getValue('cards');
            return <span className="text-muted-foreground">{cards.length}</span>;
        },
    },
    {
      accessorKey: 'subscription',
      header: 'End Date',
      cell: ({ row }) => {
          const subscription = row.getValue<{ estimatedEndDate: Date }>('subscription');
          if (subscription && subscription.estimatedEndDate) {
            const endDate = new Date(subscription.estimatedEndDate);
            return <span className="text-muted-foreground">{`${endDate.toDateString()}`}</span>;
        } else {
            return <span className="text-muted-foreground">No subscription</span>;
        }
      },
    },
    {
        accessorKey: 'lastlogin',
        header: 'Login',
        cell: ({ row }) => {
            const lastLogin: any = row.getValue('lastlogin');
            return <span className="text-muted-foreground">{`${lastLogin.toDateString()}`}</span>;
        },
    },
];

export type fetchAllMemberFunction = (authenticatedUserId: string) => Promise<MembersListType[]>;

