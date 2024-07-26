import { Usertype } from "@/types";

export const sidebarLinks = [
  {
    imgURL: "/assets/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/search.svg",
    route: "/search",
    label: "Search",
  },
  {
    imgURL: "/assets/heart.svg",
    route: "/notifications",
    label: "Notification",
  },
  {
    imgURL: "/assets/create.svg",
    route: "/workspace/create-card",
    label: "Create Card",
  },
  {
    imgURL: "/assets/user.svg",
    route: "/profile",
    label: "Profile",
  },
];

export const personalTabs = [
  { value: "flexCard", label: "CARDS", icon: "/assets/grid-dark.svg" },
  { value: "saved", label: "SAVED", icon: "/assets/saved-dark.svg" },
];

export const organizationTabs = [
  { value: "flexCard", label: "CARDS", icon: "/assets/grid.svg" },
  { value: "about", label: "ABOUT", icon: "/assets/members.svg" },
  { value: "save", label: "SAVED", icon: "/assets/saved-dark.svg" },
];

export const adminSidebarLinks = [
  {
    icon: "Home",
    route: "/dashboard",
    label: "Dashboard",
  },
  {
    icon: "Users",
    route: "/dashboard/members",
    label: "Member",
  },
  {
    icon: "Package",
    route: "/dashboard/products",
    label: "Products",
  },
  {
    icon: "Ticket",
    route: "/dashboard/promotions",
    label: "Promotions",
  },
  {
    icon: "PiggyBank",
    route: "/dashboard/transactions",
    label: "Transactions",
  },
  {
    icon: "LineChart",
    route: "/dashboard/analytics",
    label: "Analytics",
  },
  {
    icon: "MailCheck",
    route: "/dashboard/subscription",
    label: "Subscription",
  },
  {
    icon: "Settings",
    route: "/dashboard/settings",
    label: "Settings",
  },
]

export const NormalUserAllowedRoutes: Record<Usertype, string[]> = {
  PERSONAL: ["/dashboard", "/dashboard/analytics", "/dashboard/subscription", "/dashboard/settings"],
  PREMIUM: ["/dashboard", "/dashboard/analytics", "/dashboard/subscription", "/dashboard/settings"],
  EXPERT: ["/dashboard", "/dashboard/analytics", "/dashboard/subscription", "/dashboard/settings"],
  ELITE: ["/dashboard", "/dashboard/analytics", "/dashboard/subscription", "/dashboard/settings"],
  SUPERUSER: ["/dashboard", "/dashboard/analytics", "/dashboard/settings"],
  ORGANIZATION: [],
  BUSINESS: [],
  ENTERPRISE: [],
  FLEXADMIN: ["/dashboard", "/dashboard/members", "/dashboard/products", "/dashboard/promotions", "/dashboard/transactions", "/dashboard/analytics", "/dashboard/subscription", "/dashboard/settings"],
  FLEXACCOUNTANT: ["/dashboard", "/dashboard/products", "/dashboard/promotions", "/dashboard/transactions", "/dashboard/analytics"],
  FLEXHR: ["/dashboard", "/dashboard/members", "/dashboard/analytics", "/dashboard/settings"]
};
