"use client";

import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

export interface MembersListType {
    user: string;
    accountname: string;
    image: string;
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
        accessorKey: 'accountname',
        header: 'Name',
        cell: ({ row }) => {
            const image: any = row.original.image;
            const accountname: any = row.original.accountname;
            const email: any = row.original.email;

            if (image && accountname && email) {
                return (
                    <div className="flex gap-2">
                        <img src={row.original.image} alt="Customer" className="w-10 h-10 rounded-full self-center" />
                        <div className="text-center w-full">
                            <span>{row.original.accountname}</span>
                            <br/>
                            <span className="text-muted-foreground">{row.original.email}</span>
                        </div>
                    </div>
                )
            } else {
                return <span className="text-muted-foreground">Not yet onboarded</span>;
            }
        },
    },
    {
        accessorKey: 'usertype',
        header: 'Role',
        cell: ({ row }) => {
            const usertype: any = row.getValue('usertype');
            if (usertype.toUpperCase() == "FLEXADMIN") {
                return <Badge variant="borderRed">{usertype}</Badge>;
            } else if (usertype.toUpperCase() == "PERSONAL") {
                return <Badge variant="borderPurple">{usertype}</Badge>;
            } else if (usertype.toUpperCase() == "ORGANIZATION") {
                return <Badge variant="borderBlue">{usertype}</Badge>;
            } else if (usertype.toUpperCase() == "SUPERUSER") {
                return <Badge variant="borderYellow">{usertype}</Badge>;
            }
        },
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
        accessorKey: 'onboarded',
        header: 'Status',
        cell: ({ row }) => {
            const onboarded: any = row.getValue('onboarded');
            if (onboarded == true) {
                return <Badge variant="bgPurple">Onboarded</Badge>;
            } else {
                return <Badge variant="bgRed">Onboarding</Badge>;
            }
        },
    },
    {
        accessorKey: 'lastlogin',
        header: 'Login',
        cell: ({ row }) => {
            const lastLogin: any = row.getValue('lastlogin');
            if (lastLogin) {
                return <span className="text-muted-foreground">{`${lastLogin.toDateString()}`}</span>;
            } else {
                return <span className="text-muted-foreground">Not yet onboarded</span>;
            }
        },
    },
];

