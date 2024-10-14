"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchProfileViewDetails } from '@/lib/actions/user.actions';
import { useTheme } from '@/app/context/theme-context';


type TotalViewProfileByDateProps = {
    profileId: string | null;
    startDate: Date | null;
    endDate: Date | null;
}

export function TotalViewProfileByDate({ profileId, startDate, endDate }: TotalViewProfileByDateProps) {

    const [chartData, setChartData] = useState<any[]>([]);
    const { theme } = useTheme();

    useEffect(() => {

        if (!profileId) return;

        const fetchData = async () => {
            const response = await fetchProfileViewDetails(profileId, startDate, endDate);

            if (response.success) {
                setChartData(response.data || []);
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
                    <YAxis
                        tickFormatter={tick => tick.toString()}
                    />
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
                    <Line
                        dot={false}
                        dataKey="totalViews"
                        type="monotone"
                        name="Total Views"
                        stroke="#8884d8"
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

