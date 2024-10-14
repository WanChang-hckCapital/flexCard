"use client"

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { startOfDay } from 'date-fns';
import { fetchSubscriptionByDateRange } from '@/lib/actions/admin.actions';
import { useTheme } from '@/app/context/theme-context';


type SubscriptionsByDayChartProps = {
    startDate: Date | null;
    endDate: Date | null;
}

async function getSubscriptionSalesData(startDate: Date | null, endDate: Date | null) {

    const subscriptions = await fetchSubscriptionByDateRange(startDate, endDate);

    const dayArray: { date: any; totalSales: number }[] = [];
    let totalSales = 0;
    let numberOfTransactions = 0;

    let currentDate = startDate || (subscriptions.length ? startOfDay(subscriptions[0].transaction[0].transactionDate) : new Date());
    while (currentDate <= (endDate || new Date())) {
        dayArray.push({
            date: currentDate.toISOString().slice(0, 10),
            totalSales: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    subscriptions.forEach((subscription: { transaction: any[] }) => {
        subscription.transaction.forEach(transaction => {
            const transactionDateStr = transaction.transactionDate.toISOString().slice(0, 10);
            const day = dayArray.find(day => day.date === transactionDateStr);
            if (day) {
                day.totalSales += transaction.transactionFees;
                totalSales += transaction.transactionFees;
                numberOfTransactions++;
            }
        });
    });

    return {
        chartData: dayArray,
        amount: totalSales,
        numberOfSales: numberOfTransactions,
    };
}

export function SubscriptionsByDayChart({ startDate, endDate }: SubscriptionsByDayChartProps) {

    const [chartData, setChartData] = useState<any[]>([]);
    const { theme } = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            const response = await getSubscriptionSalesData(startDate, endDate);
            console.log("response: ", response);
            setChartData(response.chartData);
        }

        fetchData();
    }, [startDate, endDate]);

    if (chartData.length === 0) {
        return (
            <div className="text-center text-gray-500 min-h-[300px] content-center">No data available</div>
        )
    } else {
        return (
            <ResponsiveContainer width="100%" minHeight={300}>
                <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis
                        tickFormatter={tick => formatCurrency(tick)}
                    />
                    <Tooltip
                        contentStyle={{
                            background: theme === 'dark' ? "#151c2c" : "#ffffff",
                            border: "none",
                            borderRadius: "15px",
                        }}
                        formatter={value => formatCurrency(value as number)} />
                    <Line
                        dot={false}
                        dataKey="totalSales"
                        type="monotone"
                        name="Total Sales"
                        stroke="#8884d8"
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

