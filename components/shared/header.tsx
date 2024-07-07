import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Menu } from 'lucide-react'
import { Session } from 'next-auth'
import SignInButton from '../buttons/signin-button'
import SignOutButton from '../buttons/signout-button'
import Searchbar from '../Searchbar'
import { UserImage } from '@/types'

interface HeaderProps {
    session: Session | null;
    userInfoImage: UserImage | null;
}

async function Header({ session, userInfoImage }: HeaderProps) {

    const user = session?.user;

    let userImage = null;
    if (userInfoImage != null) {
        userImage = userInfoImage.binaryCode.toString();
    } else {
        userImage = user?.image;
    }

    return (
        <header className='fixed w-full z-50'>
            <nav className="topbar shadow-xl">
                {/* logo */}
                <div className="flex">
                    <Link href="/">
                        <span className='head-text font-bold'>flexCard</span>
                    </Link>
                </div>

                <Searchbar routeType={''} />

                <div className="flex items-center gap-4 w-50">
                    <Link href="/workspace/create-card">
                        <Image width={24} height={24}
                            className=""
                            src='/assets/new-card-dark.svg'
                            alt='icon create' />
                    </Link>

                    {/* <Link href="/notifications">
                        <Image width={24} height={24}
                            className=""
                            src='/assets/heart.svg'
                            alt='icon heart' />
                    </Link> */}
                    {/* <Link href="/workspace/6657da7c793f3b540da23a34"> */}
                    <Link href="/workspace/666921004eb91d4005d5a592">
                        <Image width={24} height={24}
                            className=""
                            src='/assets/heart.svg'
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
                                        href={`${session ? '/product' : 'api/auth/signin'}`}>Subscription</Link>
                                </DropdownMenuItem>
                            }
                            {
                                <>
                                    <DropdownMenuItem className='justify-center'>
                                        <Link className='font-bold'
                                            // href={`${session ? '/cards/665124264a34e4d57fcc506e' : 'api/auth/signin'}`} >
                                            href={'/cards/6673eab3337c9a8447de531d'} >
                                            cards testing
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            }
                            {
                                <>
                                    <DropdownMenuItem className='justify-center'>
                                        <Link className='font-bold'
                                            // href={`${session ? '/profile/66511403ce0e911348378718' : 'api/auth/signin'}`} >
                                            // href={'/profile/6651901f2dc11fd640957e8a'} >
                                            href={'/profile/66511403ce0e911348378718'} >
                                            other user test
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className={`${session ? 'w-8 h-8' : 'none'}`}>
                        {
                            session ?
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <div className={`relative ${userImage ? 'w-8 h-8' : 'h-8'} object-cover content-center`}>
                                            {userImage ? (
                                                <Image
                                                    fill
                                                    className="rounded-full object-cover"
                                                    src={userImage}
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
                                                    href={`${session ? `/profile/${user?.id}` : 'api/auth/signin'}`}>My Card</Link>
                                            </DropdownMenuItem>
                                        }
                                        {session &&
                                            <>
                                                <DropdownMenuItem className='justify-center'>
                                                    <Link className='font-bold'
                                                        href={`${session ? '/profile/edit' : 'api/auth/signin'}`}>
                                                        Settings
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className='justify-center'>
                                                    <Link className='font-bold'
                                                        href={`${session ? '/dashboard' : 'api/auth/signin'}`}>
                                                        Dashboard
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