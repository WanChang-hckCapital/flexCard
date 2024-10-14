/* eslint-disable react/no-unescaped-entities */
'use client'

import { useDict } from "@/app/context/dictionary-context"
import SignUpNewUser from "@/components/forms/sign-up"
import MaxWContainer from "@/components/max-w-container"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function SignUp() {
    const router = useRouter();
    const { theme } = useTheme();
    const dict = useDict(); 

    if (!dict || !dict.auth || !dict.auth.signUp) {
        return <p className="dark:text-white text-black text-center">Loading...</p>;
    }

    return (
        <MaxWContainer>
            <h1 className="dark:text-white text-black head-text font-bold text-center pt-8">{dict.auth.signUp.title}</h1>
            <div className="flex flex-col items-center w-full gap-4 pt-8">
                <SignUpNewUser btnTitle={"SignUp!"}></SignUpNewUser>
            </div>
            <div className="text-center">
                <div className="text-center pb-5">
                    <Button
                        onClick={() => {
                            router.push('sign-in');
                        }}
                        className="dark:text-white text-slate-700 font-bold"
                        variant='link'>
                        {dict.auth.signUp.alreadyHaveAccount}
                    </Button>
                </div>
                <p className="dark:text-white text-slate-700">{dict.auth.signUp.or}</p>
                <p className="dark:text-white text-slate-700 pt-2">{dict.auth.signUp.signUpWith}</p>
                <div className="flex justify-center pt-8">
                    <Button
                        onClick={async () => await signIn('google', {
                            callbackUrl: `${window.location.origin}`
                        })}
                        className="dark:bg-dark-1 bg-background text-white"
                        variant='default'>
                        <Image width={24} height={24}
                            src='/assets/google-logo.svg'
                            alt='google logo' />
                    </Button>

                    <Button
                        onClick={async () => await signIn('facebook', {
                            callbackUrl: `${window.location.origin}`
                        })}
                        className="dark:bg-dark-1 bg-background text-white"
                        variant='default'>
                        <Image width={24} height={24}
                            src='/assets/facebook-logo.svg'
                            alt='facebook logo' />
                    </Button>

                    <Button
                        onClick={async () => await signIn('line', {
                            callbackUrl: `${window.location.origin}`
                        })}
                        className="dark:bg-dark-1 bg-background text-white"
                        variant='default'>
                        <Image width={24} height={24}
                            src='/line-logo.png'
                            alt='line logo' />
                    </Button>

                    <Button
                        onClick={async () => await signIn('line', {
                            callbackUrl: `${window.location.origin}`
                        })}
                        className="dark:bg-black bg-background text-white"
                        variant='default'>
                        <Image
                            width={24}
                            height={24}
                            src={theme === 'dark' ? '/assets/apple-logo.svg' : '/assets/apple-logo-dark.svg'}
                            alt='apple logo'
                        />
                    </Button>
                </div>
            </div>

        </MaxWContainer>
    )
}