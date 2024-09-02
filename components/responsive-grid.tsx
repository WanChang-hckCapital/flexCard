"use client"

import { useState, useEffect } from "react";
import Card from "./shared/Card";
import { usePathname } from "next/navigation";
import SkeletonCard from "./skeleton-card";

const breakpoints = {
    xxl: 5,
    xl: 4,
    glg: 4,
    lg: 3,
    gmd: 2,
    md: 2,
    sm: 1,
};

function getColumnsCount(pathname: string) {
    if (typeof window === "undefined") return breakpoints.lg;
    if (pathname.startsWith("/profile/")) {
        if (window.innerWidth >= 1450) return breakpoints.glg;
        if (window.innerWidth >= 1280 && window.innerWidth < 1450) return breakpoints.lg;
        if (window.innerWidth >= 1024 && window.innerWidth < 1280) return breakpoints.gmd;
        if (window.innerWidth >= 768 && window.innerWidth < 1024) return breakpoints.md;
        return breakpoints.sm;
    } else {
        if (window.innerWidth >= 1536) return breakpoints.xxl;
        if (window.innerWidth >= 1280 && window.innerWidth < 1536) return breakpoints.xl;
        if (window.innerWidth >= 1280 && window.innerWidth < 1450) return breakpoints.glg;
        if (window.innerWidth >= 1024 && window.innerWidth < 1280) return breakpoints.lg;
        if (window.innerWidth >= 768 && window.innerWidth < 1024) return breakpoints.md;
        return breakpoints.sm;
    }
}

export default function ResponsiveGrid({ result, authActiveProfileId }: any) {
    const pathname = usePathname();
    const [columnsCount, setColumnsCount] = useState(getColumnsCount(pathname));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => setColumnsCount(getColumnsCount(pathname));

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [pathname]);

    useEffect(() => {
        setLoading(false);
    }, [result]);

    const getGridColumnsClass = () => {
        switch (columnsCount) {
            case 1:
                return "grid-cols-1";
            case 2:
                return "grid-cols-2";
            case 3:
                return "grid-cols-3";
            case 4:
                return "grid-cols-4";
            case 5:
                return "grid-cols-5";
            case 6:
                return "grid-cols-6";
            case 7:
                return "grid-cols-7";
            default:
                return "grid-cols-2";
        }
    };

    const isProfilePage = pathname.startsWith("/profile/");

    return (
        <div className={`grid ${getGridColumnsClass()} gap-2 ${isProfilePage ? "justify-center w-[70%] max-sm:w-[98%] sm:w-[95%] md:w-[75%]" : ""}`}>
            {loading
                ? Array.from({ length: columnsCount }).map((_, colIndex) => (
                    <SkeletonCard key={colIndex} />
                )) :
                Array.from({ length: columnsCount }).map((_, colIndex) => (
                    <div key={colIndex} className="grid gap-2 h-min">
                        {result
                            .filter((_: any, index: number) => index % columnsCount === colIndex)
                            .map((card: any) => (
                                <div key={card.cardId}>
                                    <div className={`h-auto max-w-fit max-sm:max-w-[360px] xxl:max-w-[230px] ${isProfilePage ? "max-w-[220px]" : ""} rounded-lg`}>
                                        <Card
                                            id={card.cardId}
                                            authActiveProfileId={authActiveProfileId}
                                            title={card.title}
                                            creator={card.creator}
                                            likes={card.likes}
                                            followers={[]}
                                            lineComponents={card.lineComponents.content}
                                            flexHtml={card.flexHtml.content}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                ))}
        </div>
    );
}
