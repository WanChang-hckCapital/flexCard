"use client"

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchMemberByDateRange } from '@/lib/actions/admin.actions';
import { startOfDay } from 'date-fns';

type MembersTotalByTypeChartProps = {
    startDate: Date | null;
    endDate: Date | null;
}

async function getMembersAggregatedByDateAndType(startDate: Date | null, endDate: Date | null) {
    const members = await fetchMemberByDateRange(startDate, endDate);

    const dayArray: { date: any; totalMembers: number; totalPersonal: number; totalOrganization: number; }[] = [];
    let totalMembers = 0;
    let totalPersonal = 0;
    let totalOrganization = 0;

    let currentDate = startDate || (members.length ? startOfDay(members[0].createdAt) : new Date());

    while (currentDate <= (endDate || new Date())) {
        dayArray.push({
            date: currentDate.toISOString().slice(0, 10),
            totalMembers: 0,
            totalPersonal: 0,
            totalOrganization: 0
        });
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    members.forEach((member: { createdAt: Date, usertype: string }) => {
        const memberDateStr = member.createdAt.toISOString().slice(0, 10);
        const day = dayArray.find(day => day.date === memberDateStr);

        if (day) {
            day.totalMembers += 1;
            totalMembers += 1;

            if (member.usertype === 'PERSONAL') {
                day.totalPersonal += 1;
                totalPersonal += 1;
            } else if (member.usertype === 'ORGANIZATION') {
                day.totalOrganization += 1;
                totalOrganization += 1;
            }
        }
    });

    dayArray.reduce((acc, day) => {
        day.totalMembers = acc.totalMembers + day.totalMembers;
        day.totalPersonal = acc.totalPersonal + day.totalPersonal;
        day.totalOrganization = acc.totalOrganization + day.totalOrganization;

        return {
            totalMembers: day.totalMembers,
            totalPersonal: day.totalPersonal,
            totalOrganization: day.totalOrganization
        };
    }, { totalMembers: 0, totalPersonal: 0, totalOrganization: 0 });

    return {
        chartData: dayArray,
        totalMembers,
        totalPersonal,
        totalOrganization
    };
}


export function MembersTotalByTypeChart({ startDate, endDate }: MembersTotalByTypeChartProps) {

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getMembersAggregatedByDateAndType(startDate, endDate);
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
                    formatter={(value, name, props) => {
                        let label = name === 'totalPersonal' ? 'Personal' : 'Organization';
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
                <Line type="monotone" dataKey="totalPersonal" stroke="#8884d8" />
                <Line type="monotone" dataKey="totalOrganization" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
}
