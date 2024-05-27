"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchMemberByDateRange } from '@/lib/actions/admin.actions';
import { startOfDay } from 'date-fns';

type MembersByDayChartProps = {
    startDate: Date | null;
    endDate: Date | null;
}

async function getMembersByDateRange(startDate: Date | null, endDate: Date | null) {

    const members = await fetchMemberByDateRange(startDate, endDate);

    const dayArray: { date: string; totalMembers: number }[] = [];

    let currentDate = startDate || (members.length ? startOfDay(members[0].createdAt) : new Date());
    while (currentDate <= (endDate || new Date())) {
        dayArray.push({
            date: currentDate.toISOString().slice(0, 10),
            totalMembers: 0
        });
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    members.forEach((member: { createdAt: Date }) => {
        const memberDateStr = member.createdAt.toISOString().slice(0, 10);
        const day = dayArray.find(day => day.date === memberDateStr);
        if (day) {
            day.totalMembers += 1;
        }
    });

    return {
        chartData: dayArray
    };
}

export function MembersByDayChart({ startDate, endDate }: MembersByDayChartProps) {

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getMembersByDateRange(startDate, endDate);
            setChartData(response.chartData);
        }

        fetchData();
    }, [startDate, endDate]);

    return (
        <ResponsiveContainer width="100%" minHeight={300}>
            <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis
                    tickFormatter={tick => tick.toString()}
                />
                <Tooltip
                    contentStyle={{ background: "#151c2c", border: "none", borderRadius: "15px" }}
                    formatter={(value, name, props) => [
                        `${value} members`,
                        `Date: ${props.payload.date}`
                    ]}
                />
                <Line
                    dot={false}
                    dataKey="totalMembers"
                    type="monotone"
                    name="Total Members"
                    stroke="#8884d8"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
