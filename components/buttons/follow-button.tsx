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

function FollowButton({ authUserId, accountId, method }: Props) {
  const handleButtonClick = async () => {
    try {
      await updateMemberFollow({ authUserId, accountId, method });
    } catch (error) {
      console.error('Error updating member following:', error);
    }
  };

  return (
    <Button
      className='px-3 w-full '
      variant='sky'
      onClick={handleButtonClick}
    >
      <Image
        width={16}
        height={16}
        className="rounded-full mr-3"
        src='/assets/user.svg'
        alt='profile icon'
      />
      Follow
    </Button>
  );
}

export default FollowButton;
