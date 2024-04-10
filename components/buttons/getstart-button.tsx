'use client'

import React from 'react';
import Image from 'next/image';
import { updateMemberFollow } from '@/lib/actions/user.actions';
import { Button } from '../ui/button';

interface Props {
  authUserId: string;
  accountId: string;
  method: string;
}

function GetStartButton() {
  const handleButtonClick = async () => {
    // try {
    //   await updateMemberFollow({ authUserId, accountId, method });
    // } catch (error) {
    //   console.error('Error updating member following:', error);
    // }
  };

  return (
    <Button
      className='px-3 w-full rounded-full'
      variant='secondary'
      onClick={handleButtonClick}
    >
      Get Started
    </Button>
  );
}

export default GetStartButton;
