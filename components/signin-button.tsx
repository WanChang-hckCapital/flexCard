'use client'

import React from 'react'
import { Button } from './ui/button'
import { signIn } from 'next-auth/react'

function SignInButton() {
  return (
    <Button
    className='px-3 w-full '
    variant='ghost'
    onClick={() => signIn()}
    >Sign in</Button>
  )
}

export default SignInButton