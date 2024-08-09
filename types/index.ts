import { UUID } from "mongodb";

export enum BookingStatus {
  PENDING = "PENDING",
  RENTED = "RENTED",
  RETURNED = "RETURNED",
  CANCELLED = "CANCELLED",
}

export type Price = {
  daily: number;
  hourly: number;
};

export type Member = {
    user: {},
    generatedId: string,
    accountname: string,
    image: string,
    email: string,
    password: string,
    phone: string,
    shortdescription: string,
    usertype: string,
    accountType: string,
    role: string,
    onboarded: boolean,
    ip_address: string,
    country: string,
    countrycode: string,
    stripeCustomerId: string,
    subscription: {},
    cards: Card[],
    closeFriends: Member[],
    blockedUsers: Member[],
    followers: Member[],
    following: Member[],
    organization: Organization,
    offers: Offer[],
    totalViews: number,
    viewDetails: ViewDetail[];
    updateHistory: [],
    lastlogin: Date,
}

export type Organization = {
    document: [],
    employees: Member[],
    businessType: string,
    businessLocation: string,
    legalBusinessName: string,
    businessRegistrationNumber: string,
    businessName: string,
    businessAddress: string,
    businessPhone: string,
    industry: string,
    businessWebsite: string,
    businessProductDescription: string,
    bankAccountHolder: string,
    bankName: string,
    bankAccountNumber: string,
    verify: {
        verified: boolean,
        verifiedAt: Date,
        verifiedBy: {},
    },
}

export enum Usertype {
  PERSONAL = "PERSONAL",
  PREMIUM = "PREMIUM",
  EXPERT = "EXPERT",
  ELITE = "ELITE",
  ORGANIZATION = "ORGANIZATION",
  BUSINESS = "BUSINESS",
  ENTERPRISE = "ENTERPRISE",
  SUPERUSER = "SUPERUSER",
  FLEXACCOUNTANT = "FLEXACCOUNTANT",
  FLEXHR = "FLEXHR",
  FLEXADMIN = "FLEXADMIN",
}

export enum Role {
    FLEXADMIN = 'FLEXADMIN',
    PERSONAL = 'PERSONAL',
    SUPERUSER = 'SUPERUSER',
    ORGANIZATION = 'ORGANIZATION',
}

export type Card = {
    cardID: string,
    creator: {},
    title: string,
    status: string,
    description: string,
    likes: [],
    followers: [],
    categories: [],
    components: {},
    lineFormatComponent: {},
    flexFormatHtml: {},
    comments: [],
    totalViews: number,
    viewDetails: ViewDetail[];
    updateHistory: [],
    updatedAt: Date,
    createdAt: Date,
}

export type Comment = {
    commentID: string,
    comment: string,
    commentBy: {},
    commentDate: Date,
    likes: {},
    replies: Comment[];
}

export type ViewDetail = {
  viewerId: string;
  viewedAt: Date;
};

export type Component = {
  componentID: string;
  componentType: string;
  content: {};
};

export type UserImage = {
  binaryCode: {};
  name: string;
};

export type Subscription = {
  id: string;
  planStarted: Date;
  estimatedEndDate: Date;
  paidTerms: number;
  totalAmount: number;
  plan: Product;
  transaction: Transaction[];
  stripeSubscriptionId: string;
  status: string;
};

export type Offer = {
    plan: Product,
    startDate: Date,
    endDate: Date,
    type: string,
}

export type Transaction = {
  id: string;
  transactionDate: Date;
  transactionFees: number;
  ip_address: string;
  payment_types: string;
  currency: string;
  transactionStatus: boolean;
};

export type Product = {
    name: string,
    description: string,
    category: string,
    price: number,
    availablePromo: string,
    stripeProductId: string,
    monthlyDiscount: number,
    annualDiscount: number,
    features: string[],
    limitedIP: number,
    limitedCard: number,
}

export type Promotion = {
  id: string;
  name: string;
  code: string;
  discount: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  limitedQuantity: number;
};

export type Feedback = {
  selectedReasons: string[];
  otherReason: string;
  hasUsedSimilar: boolean;
  similarAppName: string;
  feedbackComment: string;
  isSkip: boolean;
  feedbackDate: Date;
  feedbackBy: {};
};

export enum ItemStatus {
  LISTED = "listed",
  UNLISTED = "unlisted",
}

export type User = {
  _id: string;
  generatedId: string;
  name: string;
  email: string;
  image: string;
  emailVerified: string;
};

export type Friend = {
  generatedId: string;
  userA: {};
  userB: {};
  created_at?: Date;
  updated_at?: Date;
};

export type FriendRequest = {
  _id: string;
  sender: {};
  receiver: {};
  status: number;
};

export type FollowRequest = {
  _id: string;
  sender: {};
  receiver: {};
  status: number;
};

// workspace
