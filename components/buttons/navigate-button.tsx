'use client'

import React from 'react'
import { Button } from '../ui/button'

interface Props {
    url: string;
    btnName: string;
  }

function NavigateRouteButton({ url, btnName }: Props) {
   const handleRoute = () => {
        window.location.href = url;
    };

    return (
        <Button
            className='px-3 my-3'
            variant='outline'
            onClick={handleRoute}
        >
            {btnName}
        </Button>
    )
}

export default NavigateRouteButton