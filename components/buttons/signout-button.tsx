'use client'

import React from 'react'
import { Button } from '../ui/button'
import { signOut } from 'next-auth/react'

function SignOutButton() {

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = '/';
  }

  return (
    <Button
    className='px-0 w-full'
    variant='ghost'
    onClick={handleSignOut}
    >Sign out</Button>
  )
}

export default SignOutButton