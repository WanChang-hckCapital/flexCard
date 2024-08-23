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
  user: {};
  generatedId: string;
  accountname: string;
  image: string;
  email: string;
  password: string;
  phone: string;
  shortdescription: string;
  usertype: string;
  onboarded: boolean;
  ip_address: string;
  country: string;
  countrycode: string;
  stripeCustomerId: string;
  subscription: {};
  cards: Card[];
  followers: Member[];
  following: Member[];
  organization: {};
  trial: Trial[];
  totalViews: number;
  viewDetails: ViewDetail[];
  updateHistory: [];
  lastlogin: Date;
  accountType: string;
};

export type Organization = {
  organizationID: {};
  document: [];
  employees: Member[];
  webUrl: string;
};

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

export type Card = {
  cardID: string;
  creator: {};
  title: string;
  status: string;
  description: string;
  likes: [];
  followers: [];
  categories: [];
  components: {};
  lineFormatComponent: {};
  flexFormatHtml: {};
  totalViews: number;
  viewDetails: ViewDetail[];
  updateHistory: [];
  updatedAt: Date;
  createdAt: Date;
};

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

export type Trial = {
  trialPlan: Product;
  trialStartDate: Date;
  trialEndDate: Date;
};

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
  name: string;
  description: string;
  price: number;
  availablePromo: string;
  stripeProductId: string;
  monthlyDiscount: number;
  annualDiscount: number;
  features: string[];
  limitedIP: number;
  limitedCard: number;
};

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

export type Chatroom = {
  _id: string;
  name: string;
  type: string;
  participants: {};
};

export type ChatroomParticipants = {
  userID: {};
  chatroomID: {};
  role: string;
};

export type Message = {
  chatroomId: {};
  senderId: {};
  content: string;
  readStatus: [];
  imageAttach: string | null;
};
// workspace
