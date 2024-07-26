
"use client";

import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

export interface TransactionsListType {
    transactionDate: Date;
    transactionFees: string;
    transactionStatus: boolean;
}

export const columns: ColumnDef<TransactionsListType>[] = [
    {
        accessorKey: 'transactionDate',
        header: 'Transaction Date',
        cell: ({ row }) => {
            const transDate = row.getValue<Date>('transactionDate');
            if (transDate) {
                const endDate = new Date(transDate);
                return <span className="text-muted-foreground">{endDate.toDateString()}</span>;
            } else {
                return <span className="text-muted-foreground">No transaction yet</span>;
            }
        },
    },
    {
        accessorKey: 'transactionFees',
        header: 'Transaction Fees',
        cell: ({ row }) => {
            const transactionFees: any = row.getValue('transactionFees');
            return <span className="text-muted-foreground">${transactionFees}</span>;
        },
    },
    {
        accessorKey: 'transactionStatus',
        header: 'Status',
        cell: ({ row }) => {
            const status: any = row.getValue('transactionStatus');
            if (status == true) {
                return <Badge variant="borderGreen">Done</Badge>;
            } else if (status.toUpperCase() == "ACTIVE") {
                return <Badge variant="borderRed">Failed</Badge>;
            }
        },
    },
];

export type fetchAllTransactionFunction = (authenticatedUserId: string) => Promise<TransactionsListType[]>;

