import { StringLike } from '@firebase/util'
import { Document } from 'mongoose'

export interface Item extends Document {
    name: string,
    hostid?: string,
    price: Price,
    photos: string[],
    description: string,
    status: string,
    category: string,
    numberOfBookings?: number
}

export interface Booking extends Document {
    itemid?: string,
    guestid?: string,
    rentstart: Date,
    rentend: Date,
    duration: number        // number of days or hours
    durationtype: string    // hourly or daily
    amount: number
    comment: string,
    rating: number          // out of 5
    stripeid?: string,
    status: BookingStatus
    /*
        pending // item to pickup in future
        rented  // currently guest has item
        returned // when an item is returned
        
    */
}

export enum BookingStatus {
    PENDING = 'PENDING',
    RENTED = 'RENTED',
    RETURNED = 'RETURNED',
    CANCELLED = 'CANCELLED'
}

export type Price = {
    daily: number,
    hourly: number
}

export type Member = {
    user: {},
    accountname: string,
    image: string,
    email: string,
    password: string,
    phone: string,
    shortdescription: string,
    usertype: string,
    onboarded: boolean,
    subscription: [Subscription],
    cards: [Card],
    followers: [Member],
    following: [Member],
    organization: {},
}

export type Organization = {
    organizationID: {},
    document: [],
    employees: [Member],
    webUrl: string,
}

export enum Usertype {
    PERSONAL = 'PERSONAL',
    PREMIUM = 'PREMIUM',
    EXPERT = 'EXPERT',
    ELITE = 'ELITE',
    ORGANIZATION = 'ORGANIZATION',
    BUSINESS = 'BUSINESS',
    ENTERPRISE = 'ENTERPRISE',
}

export type Card = {
    creator: {},
    title: string,
    status: string,
    description: string,
    likes: [],
    followers: [],
    categories: [],
    components: [],
    updatedAt: Date,
    createdAt: Date,
}

export type UserImage = {
    binaryCode: {},
    name: string,
}

export type Subscription = {
    id: string,
    planStarted: Date,
    estimatedEndDate: Date,
    autoRenew: boolean,
    paidTerms: number,
    plan: Product,
}

export type Product = {
    id: string,
    name: string,
    description: string,
    price: number,
    limitedCard: number,
}

export enum ItemStatus {
    LISTED = 'listed',
    UNLISTED = 'unlisted'
}

// workspace