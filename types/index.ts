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

export type MemberType = {
  user: {};
  generatedId: string;
  email: string;
  password: string;
  phone: string;
  ip_address: string;
  country: string;
  countrycode: string;
  profiles: Profile[];
  activeProfile: number;
  lastlogin: Date;
};

export type Profile = {
  _id: string;
  email: string;
  accountname: string;
  image: { binaryCode: string }[];
  shortdescription: string;
  usertype: string;
  accountType: string;
  role: string;
  onboarded: boolean;
  preferences: {
    theme: string;
    language: string;
    categories: string[];
    isSkip: boolean;
  };
  cards: Card[];
  followers: Profile[];
  following: Profile[];
  closeFriends: Profile[];
  blockedAccounts: Profile[];
  mutedAccounts: Profile[];
  organization: Organization;
  offers: Offer[];
  stripeCustomerId: string;
  subscription: {};
  totalViews: number;
  viewDetails: ViewDetail[];
  updateHistory: [];
};

export type LineUser = {
  userId: string;
  name: string;
  email: string;
  image: string;
}

export type Organization = {
  document: [];
  employees: MemberType[];
  businessType: string;
  businessLocation: string;
  legalBusinessName: string;
  businessRegistrationNumber: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  industry: string;
  businessWebsite: string;
  businessProductDescription: string;
  bankAccountHolder: string;
  bankName: string;
  bankAccountNumber: string;
  verify: {
    verified: boolean;
    verifiedAt: Date;
    verifiedBy: {};
  };
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

export enum Role {
  FLEXADMIN = "FLEXADMIN",
  PERSONAL = "PERSONAL",
  SUPERUSER = "SUPERUSER",
  ORGANIZATION = "ORGANIZATION",
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
  comments: [];
  totalViews: number;
  viewDetails: ViewDetail[];
  updateHistory: [];
  updatedAt: Date;
  createdAt: Date;
};

export type Comment = {
  commentID: string;
  comment: string;
  commentBy: {};
  commentDate: Date;
  likes: {};
  replies: Comment[];
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

export type Offer = {
  plan: Product;
  startDate: Date;
  endDate: Date;
  type: string;
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
  category: string;
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
  superAdmin: [];
  admin: [];
  silentUser: any[];
  groupImage: {};
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
  fileAttach: string | null;
  locationLink: string | null;
  shopName: string | null;
  pictureLink: string | null;
  card: {};
};
// workspace

export type Blog = {
  title: string;
  slug: string;
  excerpt: string;
  image: {};
  author: {};
};

export type BlogComment = {
  content: string;
  blog: {};
  image?: {};
  author: {};
  likes: { user: {}; likedAt: Date }[];
  replyCount: number;
};

export type BlogCommentReply = {
  content: string;
  blog: {};
  image?: {};
  comment: {};
  author: {};
  likes: { user: {}; likedAt: Date }[];
};

export type BlogInvitation = {
  inviter: {};
  invitee: {};
  status: {};
  sentAt: Date;
  acceptedAt: Date;
  declinedAt: Date;
};

export type Forum = {
  title: string;
  slug: string;
  content: string;
  image: {};
  author: {};
  forumType: {};
  viewCount: number;
  commentCount: number;
};

export type ForumComment = {
  content: string;
  forum: {};
  image?: {};
  author: {};
  likes: { user: {}; likedAt: Date }[];
  replyCount: number;
};

export type ForumCommentReply = {
  content: string;
  forum: {};
  image?: {};
  comment: {};
  author: {};
  likes: { user: {}; likedAt: Date }[];
};

export type ForumType = {
  name: string;
  active: Boolean;
  createdBy: {};
  createdAt: Date;
};
