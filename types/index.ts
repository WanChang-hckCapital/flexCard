import { UUID } from "mongodb"

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
    cardID: string,
    creator: string,
    title: string,
    status: string,
    description: string,
    likes: [],
    followers: [],
    categories: [],
    components: {},
    updatedAt: Date,
    createdAt: Date,
}

export type Component = {
    ComponentID: string,
    content: {},
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