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
    name: string,
    phone: string,
    email: string,
    accountname: string,
    password: string,
    image: string,
    shortdescription: string,
    usertype: string,
    subscription: [Subscription],
    cards: [Card],
    followers: [Member],
    following: [Member],
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
    id: string,
    name: string,
    status: string,
    description: string,
    categories: [],
    components: [],
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