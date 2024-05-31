'use client'

import React from 'react';
import { Button } from '../ui/button';
import { RiUserUnfollowLine } from 'react-icons/ri';
import { updateMemberFollow } from '@/lib/actions/user.actions';
import { toast } from 'sonner';

interface Props {
  authUserId?: string;
  accountId: string;
  method: "FOLLOW" | "UNFOLLOW";
}

function UnFollowButton({ authUserId, accountId, method }: Props){
  const handleButtonClick = async () => { 
    if(!authUserId){
      toast.error('You need to login first before action.');
      return;
    }

    try {
      await updateMemberFollow({ authUserId, accountId, method });
    } catch (error) {
      toast.error('Failed to do action, please try again.');
    }
  };

  return (
    <Button
      className="px-3 w-full"
      variant="ghost"
      onClick={handleButtonClick}
    >
      <RiUserUnfollowLine className='mr-3'/>
      Unfollow
    </Button>
  );
}

export default UnFollowButton;
