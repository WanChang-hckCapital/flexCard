"use client"

interface Props {
    flexHtml: string;
}

export default function CardComponent({ flexHtml }: Props) {
    return (
        <div
            dangerouslySetInnerHTML={{ __html: flexHtml }}
            className='flex w-full flex-col items-center max-w-full'
        />
    )
}