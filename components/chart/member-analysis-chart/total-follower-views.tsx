"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchFollowersByDateRange } from '@/lib/actions/user.actions';


type TotalFollowersByDateProps = {
    profileId: string | null;
    startDate: Date | null;
    endDate: Date | null;
}

export function TotalFollowersByDate({ profileId, startDate, endDate }: TotalFollowersByDateProps) {

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {

        if(!profileId) return;
        
        const fetchData = async () => {
            const response = await fetchFollowersByDateRange(profileId, startDate, endDate);
            
            if(response.success){
                setChartData(response.data || []);
            }else{ 
                setChartData([]);
            }
        }

        fetchData();
    }, [profileId, startDate, endDate]);

    if(chartData.length === 0) {
        return (
            <div className="text-center text-gray-500 min-h-[300px] content-center">No data available</div>
        )
    }else{
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
                            `${value} followers`,
                            `Date: ${props.payload.date}`
                        ]}
                    />
                    <Line
                        dot={false}
                        dataKey="totalFollowedUser"
                        type="monotone"
                        name="Total Followers"
                        stroke="#8884d8"
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

