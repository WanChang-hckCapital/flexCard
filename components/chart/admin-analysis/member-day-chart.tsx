"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchCountMemberProfileByDateRange } from '@/lib/actions/admin.actions';
import { startOfDay } from 'date-fns';

type MembersByDayChartProps = {
    startDate: Date | null;
    endDate: Date | null;
}

export function MembersByDayChart({ startDate, endDate }: MembersByDayChartProps) {

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchCountMemberProfileByDateRange(startDate, endDate);
            setChartData(response.data || []);
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
                    dataKey="totalProfiles"
                    type="monotone"
                    name="Total Member Profiles"
                    stroke="#8884d8"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
