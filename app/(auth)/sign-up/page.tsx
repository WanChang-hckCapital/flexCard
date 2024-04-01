/* eslint-disable react/no-unescaped-entities */
'use client'

import SignUpNewUser from "@/components/forms/sign-up"
import MaxWContainer from "@/components/max-w-container"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function SignUp() {
    const router = useRouter();

    return (
        <MaxWContainer>
            <h1 className="head-text font-bold text-center pt-8">Let's Go!</h1>
            <div className="flex flex-col items-center w-full gap-4 pt-8">
                <SignUpNewUser btnTitle={"SignUp!"}></SignUpNewUser>
            </div>
            <div className="text-center">
                <div className="text-center pb-5">
                    <Button
                        onClick={() => {
                            router.push('sign-in');
                          }}
                        className="text-white font-bold"
                        variant='link'>
                        Already have an account?
                    </Button>
                </div>
                <p>or</p>
                <p className="pt-2">Sign Up with</p>
                <div className="flex justify-center pt-8">
                    <Button
                        onClick={async () => await signIn('google', {
                            callbackUrl: `${window.location.origin}`
                        })}
                        className="bg-dark-1 text-white"
                        variant='default'>
                        <Image width={24} height={24}
                            src='/google-logo.svg'
                            alt='google logo' />
                    </Button>

                    <Button
                        onClick={async () => await signIn('facebook', {
                            callbackUrl: `${window.location.origin}`
                        })}
                        className="bg-dark-1 text-white"
                        variant='default'>
                        <Image width={24} height={24}
                            src='/facebook-logo.svg'
                            alt='facebook logo' />
                    </Button>

                    <Button
                        onClick={async () => await signIn('line', {
                            callbackUrl: `${window.location.origin}`
                        })}
                        className="bg-dark-1 text-white"
                        variant='default'>
                        <Image width={24} height={24}
                            src='/line-logo.png'
                            alt='line logo' />
                    </Button>

                    <Button
                        onClick={async () => await signIn('line', {
                            callbackUrl: `${window.location.origin}`
                        })}
                        className="bg-dark-1 text-white"
                        variant='default'>
                        <Image width={24} height={24}
                            src='/apple-logo-dark.svg'
                            alt='apple logo' />
                    </Button>
                </div>
            </div>

        </MaxWContainer>
    )
}