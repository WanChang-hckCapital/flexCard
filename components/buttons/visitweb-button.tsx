'use client'

import React from 'react'
import { Button } from '../ui/button'
import { CiShare1 } from "react-icons/ci";

interface Props {
    url: string,
}

function VisitWebButton({
    url,
}: Props) {
   const handleVisitWebsite = () => {
        window.location.href = url;
    };

    return (
        <Button
            className='px-3 w-full '
            variant='ghost'
            onClick={handleVisitWebsite}
        >
            Visit Website
            <CiShare1 className='ml-3'/>
        </Button>
    )
}

export default VisitWebButton