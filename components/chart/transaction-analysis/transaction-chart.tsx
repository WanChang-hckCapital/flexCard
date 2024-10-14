"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchTransactionStats } from '@/lib/actions/admin.actions';
import { useTheme } from '@/app/context/theme-context';

type TransactionAnalysisByDateProps = {
    profileId: string | null;
    startDate: Date | null;
    endDate: Date | null;
}

export function TransactionAnalysisByDate({ profileId, startDate, endDate }: TransactionAnalysisByDateProps) {

    const [chartData, setChartData] = useState<any[]>([]);
    const { theme } = useTheme();

    useEffect(() => {

        if (!profileId) return;

        const fetchData = async () => {
            const transactionStats = await fetchTransactionStats(profileId, startDate, endDate);

            if (transactionStats.success == true) {
                setChartData(transactionStats.chartData || []);
            } else {
                setChartData([]);
            }
        }

        fetchData();
    }, [profileId, startDate, endDate]);

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
                        contentStyle={{
                            background: theme === 'dark' ? "#151c2c" : "#ffffff",
                            border: "none",
                            borderRadius: "15px",
                        }}
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

