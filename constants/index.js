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
    icon: "Settings",
    route: "/dashboard/settings",
    label: "Settings",
  },
]
