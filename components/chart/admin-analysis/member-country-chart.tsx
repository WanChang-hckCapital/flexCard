"use client"

import React, { useEffect, useState } from 'react';
import {  Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchAllMember } from '@/lib/actions/admin.actions';


type MembersCountryChartProps = {
    authenticatedUserId: string;
}

async function getMembersCountry(authenticatedUserId: string) {
    try {
        const members = await fetchAllMember(authenticatedUserId);
        const countryCount: any = {};

        if (!members) {
            return [];
        }

        members.forEach(member => {
            const country = member.country || 'Unknown';
            countryCount[country] = (countryCount[country] || 0) + 1;
        });

        const chartData = Object.keys(countryCount).map(country => ({
            name: country,
            value: countryCount[country]
        }));

        return chartData;
    } catch (error) {
        console.error("Failed to fetch members by country:", error);
        return [];
    }
}


export function MembersCountryTypeChart({ authenticatedUserId }: MembersCountryChartProps) {

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getMembersCountry(authenticatedUserId);
            setChartData(response);
        }

        fetchData();
    }, [authenticatedUserId]);
    
    const COLORS = ['#0088FE', '#8884d8', '#82ca9d', '#FFBB28', '#FF8042'];

    return (
        <ResponsiveContainer width="100%" minHeight={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ background: "#151c2c", border: "none", borderRadius: "15px"}} 
                    labelStyle={{display: "none"}}
                    itemStyle={{ color: "white" }}
                    formatter={(value, name) => {
                        return [
                            `${value} Members`,
                            `Country: ${name}`,
                        ];
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
