'use client'

import React from 'react';
import { Button } from '../ui/button';
import { RiUserUnfollowLine } from 'react-icons/ri';
import { updateMemberFollow } from '@/lib/actions/user.actions';

interface Props {
  authUserId: string;
  accountId: string;
  method: string;
}

function UnFollowButton({ authUserId, accountId, method }: Props){
  const handleButtonClick = async () => {
    try {
      await updateMemberFollow({ authUserId, accountId, method });
    } catch (error) {
      console.error('Error updating member following:', error);
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
