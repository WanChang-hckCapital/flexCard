'use client'

import React from 'react'
import { Button } from '../ui/button'
import { signIn } from 'next-auth/react'

function SignInButton({ dict }: any) {
  return (
    <Button
      className='px-3 w-full '
      variant='ghost'
      onClick={() => signIn()}
    >
      {dict.header.signIn}
    </Button>
  )
}

export default SignInButton