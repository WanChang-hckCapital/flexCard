"use client"

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfDay } from 'date-fns';
import { fetchCardViewDetails } from '@/lib/actions/user.actions';


type TotalViewCardsByCardIdProps = {
    cardId: string | null;
    startDate: Date | null;
    endDate: Date | null;
}

export function TotalViewCardsByCardIdChart({ cardId, startDate, endDate }: TotalViewCardsByCardIdProps) {

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {

        if(!cardId) return;
        
        const fetchData = async () => {
            const response = await fetchCardViewDetails(cardId, startDate, endDate);
            
            if(response.success){
                setChartData(response.data || []);
            }else{ 
                setChartData([]);
            }
        }

        fetchData();
    }, [cardId, startDate, endDate]);

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

