import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { buttonVariants } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Menu } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import SignInButton from './signin-button'
import SignOutButton from './signout-button'
import Searchbar from './Searchbar'

async function Header() {

    const session = await getServerSession(authOptions)
    console.log("image: " + JSON.stringify(session));

    return (
        <header className='fixed w-full z-50'>
            <nav className="bg-primary flex item-center justify-between p-4 lg:px-8">
                {/* logo */}
                <div className="flex">
                    <Link href="/">
                        <span className='head-text font-bold'>flexCard</span>
                    </Link>
                </div>

                <Searchbar routeType={''} />

                <div className="flex items-center gap-4 w-50">
                    <Link href="/create-card">
                        <Image width={24} height={24}
                            className=""
                            src='assets/new-card-dark.svg'
                            alt='icon create' />
                    </Link>

                    <Link href="/notifications">
                        <Image width={24} height={24}
                            className=""
                            src='assets/heart.svg'
                            alt='icon heart' />
                    </Link>

                    {/* drop down menu*/}
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="flex">
                                <Menu />
                                {/* {
                                    session?.user &&
                                    <p>{session.user.name?.split(' ')[0]}</p>
                                } */}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='mt-3'>
                            {session &&
                                <DropdownMenuItem className='justify-center'>
                                    <Link
                                        className='flex font-bold'
                                        href={`${session ? '/other' : 'api/auth/signin'}`}>Other</Link>
                                </DropdownMenuItem>
                            }
                            {session &&
                                <>
                                    <DropdownMenuItem className='justify-center'>
                                        <Link className='font-bold'
                                            href={`${session ? '/other' : 'api/auth/signin'}`}>
                                            Ohter
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="">
                        {
                            session ?
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <div>
                                            {session?.user?.image ? (
                                                <Image
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                    src={session.user.image}
                                                    alt='icon heart' />
                                            ) : (
                                                <p>{session.user.name?.split(' ')[0]}</p>
                                            )}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='mt-3'>
                                        {session &&
                                            <DropdownMenuItem className='justify-center'>
                                                <Link
                                                    className='flex font-bold'
                                                    href={`${session ? '/my-card' : 'api/auth/signin'}`}>My Card</Link>
                                            </DropdownMenuItem>
                                        }
                                        {session &&
                                            <>
                                                <DropdownMenuItem className='justify-center'>
                                                    <Link className='font-bold'
                                                        href={`${session ? '/setting' : 'api/auth/signin'}`}>
                                                        Settings
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator></DropdownMenuSeparator>
                                            </>
                                        }

                                        <DropdownMenuItem className='flex text-left py-0 w-full'>
                                            {
                                                session ? <SignOutButton /> : <SignInButton />
                                            }
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu> :
                                <SignInButton />
                        }
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header