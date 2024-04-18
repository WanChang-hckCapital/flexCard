/* eslint-disable react/no-unescaped-entities */
'use client'

import SignInWithEmail from "@/components/forms/sign-in"
import MaxWContainer from "@/components/max-w-container"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function SignIn() {
    const router = useRouter();

    return (
        <MaxWContainer>
            <h1 className="head-text font-bold text-center pt-8">Sign In.</h1>

            <div className="flex flex-col items-center w-full gap-4 py-8">

                <Button
                    onClick={async () => await signIn('google', {
                        callbackUrl: `${window.location.origin}`
                    })}
                    className="text-white w-80"
                    variant='destructive'>
                    <Image width={24} height={24}
                        className="mr-5"
                        src='/google-logo.svg'
                        alt='google logo' />
                    Sign in with Google
                </Button>

                <Button
                    onClick={async () => await signIn('facebook', {
                        callbackUrl: `${window.location.origin}`
                    })}
                    className="text-white w-80"
                    variant='sky'>
                    <Image width={24} height={24}
                        className="mr-2"
                        src='/facebook-logo.svg'
                        alt='facebook logo' />
                    Sign in with Facebook
                </Button>


                {/* need to modify later */}
                <Button
                    onClick={async () => await signIn('line', {
                        callbackUrl: `${window.location.origin}`
                    })}
                    className="text-white w-80"
                    variant='green'>
                    <Image width={24} height={24}
                        className="mr-10"
                        src='/line-logo.png'
                        alt='line logo' />
                    Sign in with Line
                </Button>

                <Button
                    onClick={async () => await signIn('line', {
                        callbackUrl: `${window.location.origin}`
                    })}
                    className="bg-dark-1 text-white w-80"
                    variant='outline'>
                    <Image width={24} height={24}
                        className="mr-3"
                        src='/apple-logo-dark.svg'
                        alt='apple logo' />
                    Sign in with AppleID
                </Button>

                <p>or</p>

                <section className='w-80'>
                    <SignInWithEmail btnTitle='Sign In.' />
                </section>

                <div className="text-center">
                    <p>don't have an account?
                        <Button
                            onClick={() => {
                                router.push('sign-up');
                              }}
                            className="text-white font-bold"
                            variant='link'>
                            Create a account
                        </Button>
                    </p>
                    <Button
                        onClick={() => {
                            router.push('forgot-password');
                          }}
                        className="text-white font-bold"
                        variant='link'>
                        Forgot Password
                    </Button>
                </div>
            </div>

        </MaxWContainer>
    )
}