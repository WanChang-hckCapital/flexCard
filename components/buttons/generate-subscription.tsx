"use client";

import React from 'react'
import { Button } from '../ui/button'
import { generateSubscription } from '@/lib/actions/admin.actions';

async function GenerateSPButton() {

  const handleSubscriptionClick = async () => {
    try {
      await generateSubscription();
    } catch (error) {
      console.error('Error generating subscription.', error);
    }
  };

  return (
    <Button
    className='px-0 w-full'
    variant='outline'
    onClick={handleSubscriptionClick}
    >Create Super Account</Button>
  )
}

export default GenerateSPButton