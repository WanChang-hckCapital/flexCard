"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchTotalMemberProfileByDateRange } from '@/lib/actions/admin.actions';

type MembersTotalByTypeChartProps = {
    startDate: Date | null;
    endDate: Date | null;
}

export function MembersTotalByTypeChart({ startDate, endDate }: MembersTotalByTypeChartProps) {

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchTotalMemberProfileByDateRange(startDate, endDate);
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
                    formatter={(value, name, props) => {
                        let label = name === 'totalPersonalProfile' ? 'Personal' : 'Organization';
                        return [
                            `${value} ${label}`, 
                            `Date: ${props.payload.date}`
                        ];
                    }}
                />
                {/* <Line
                        dot={false}
                        dataKey="totalMembers"
                        type="monotone"
                        name="Total Members"
                        stroke="#8884d8"
                    /> */}
                <Line type="monotone" dataKey="totalPersonalProfile" stroke="#8884d8" />
                <Line type="monotone" dataKey="totalOrganizationProfile" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
}
