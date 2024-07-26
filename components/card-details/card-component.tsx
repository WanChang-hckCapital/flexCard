"use client"

import { rewriteFlexHtml } from "@/lib/utils";

interface Props {
    flexHtml: string;
    bubbleSize: string;
}

export default function CardComponent({ flexHtml, bubbleSize }: Props) {
    const updatedFlexHtml = rewriteFlexHtml(flexHtml, bubbleSize);

    return (
        <div
            dangerouslySetInnerHTML={{ __html: updatedFlexHtml }}
            className='flex w-full flex-col items-center max-w-full'
        />
    )
}