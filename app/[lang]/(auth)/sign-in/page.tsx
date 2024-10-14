/* eslint-disable react/no-unescaped-entities */
'use client'

import { useDict } from "@/app/context/dictionary-context"
import SignInWithEmail from "@/components/forms/sign-in"
import MaxWContainer from "@/components/max-w-container"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function SignIn() {
    const router = useRouter();
    const dict = useDict(); 

    if (!dict || !dict.auth || !dict.auth.signUp) {
        return <p className="dark:text-white text-black text-center">Loading...</p>;
    }

    return (
        <MaxWContainer>
            <h1 className="dark:text-white text-black head-text font-bold text-center pt-8">{dict.auth.signIn.title}</h1>

            <div className="flex flex-col items-center w-full gap-4 py-8">

                <Button
                    onClick={async () => await signIn('google', {
                        callbackUrl: `${window.location.origin}`
                    })}
                    className="text-white w-80"
                    variant='destructive'>
                    <Image width={24} height={24}
                        className="mr-5"
                        src='/assets/google-logo.svg'
                        alt='google logo' />
                    {dict.auth.signIn.google}
                </Button>

                <Button
                    onClick={async () => await signIn('facebook', {
                        callbackUrl: `${window.location.origin}`
                    })}
                    className="text-white w-80"
                    variant='sky'>
                    <Image width={24} height={24}
                        className="mr-2"
                        src='/assets/facebook-logo.svg'
                        alt='facebook logo' />
                    {dict.auth.signIn.facebook}
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
                    {dict.auth.signIn.line}
                </Button>

                <Button
                    onClick={async () => await signIn('line', {
                        callbackUrl: `${window.location.origin}`
                    })}
                    className="bg-dark-1 text-white w-80"
                    variant='outline'>
                    <Image width={24} height={24}
                        className="mr-3"
                        src='/assets/apple-logo-dark.svg'
                        alt='apple logo' />
                    {dict.auth.signIn.apple}
                </Button>

                <p className="dark:text-white text-slate-700">{dict.auth.signUp.or}</p>

                <section className='w-80'>
                    <SignInWithEmail btnTitle= {dict.auth.signIn.btnSignIn} />
                </section>

                <div className="text-center">
                    <p className="dark:text-white text-slate-700">{dict.auth.signIn.noAccount}
                        <Button
                            onClick={() => {
                                router.push('sign-up');
                              }}
                            className="dark:text-white text-slate-700 font-bold"
                            variant='link'>
                            {dict.auth.signIn.createAccount}
                        </Button>
                    </p>
                    <Button
                        onClick={() => {
                            router.push('forgot-password');
                          }}
                        className="dark:text-white text-slate-700 font-bold"
                        variant='link'>
                        {dict.auth.signIn.forgotPassword}
                    </Button>
                </div>
            </div>

        </MaxWContainer>
    )
}