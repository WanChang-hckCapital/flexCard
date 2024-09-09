'use client'

import React from 'react';
import Image from 'next/image';
import { updateMemberFollow } from '@/lib/actions/user.actions';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface Props {
  authActiveProfileId?: string;
  accountId: string;
  method: "FOLLOW" | "UNFOLLOW";
}

function FollowButton({ authActiveProfileId, accountId, method }: Props) {
  const handleButtonClick = async () => {
    if(!authActiveProfileId){
      toast.error('You need to login first before action.');
      return;
    }

    try {
      await updateMemberFollow({ authActiveProfileId, accountId, method });
    } catch (error) {
      toast.error('Failed to do action, please try again.');
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
