'use client'

import React from 'react'
import { Button } from './ui/button'
import { signOut } from 'next-auth/react'

function SignOutButton() {
  return (
    <Button
    className='px-0 w-full'
    variant='ghost'
    onClick={() => signOut()}
    >Sign out</Button>
  )
}

export default SignOutButton