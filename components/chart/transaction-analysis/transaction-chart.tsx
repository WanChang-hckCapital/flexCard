"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchTransactionStats } from '@/lib/actions/admin.actions';

type TransactionAnalysisByDateProps = {
    userId: string | null;
    startDate: Date | null;
    endDate: Date | null;
}

export function TransactionAnalysisByDate({ userId, startDate, endDate }: TransactionAnalysisByDateProps) {

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {

        if (!userId) return;

        const fetchData = async () => {
            const transactionStats = await fetchTransactionStats(userId, startDate, endDate);

            if (transactionStats.success == true) {
                setChartData(transactionStats.chartData || []);
            } else {
                setChartData([]);
            }
        }

        fetchData();
    }, [userId]);

    if (chartData.length === 0) {
        return (
            <div className="text-center text-gray-500 min-h-[300px] content-center">No data available</div>
        )
    } else {
        return (
            <ResponsiveContainer width="100%" minHeight={300}>
                <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                        contentStyle={{ background: "#151c2c", border: "none", borderRadius: "15px" }}
                        formatter={(value, name, props) => [
                            `${value} views`,
                            `Date: ${props.payload.date}`
                        ]}
                    />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                    <Line type="monotone" dataKey="fees" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

