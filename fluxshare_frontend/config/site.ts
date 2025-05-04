export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "FluxShare",
  description:
    "Decentralized payment automation platform for smart revenue splitting and transparent subscription management.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Subscriptions",
      href: "/subscription",
    },
    {
      title: "Browse Plans",
      href: "/subscription/browse",
    },
    {
      title: "Payments",
      href: "/payments",
    },
    {
      title: "Faucet",
      href: "/faucet",
    },
  ],
  links: {
    twitter: "https://x.com/kamalbuilds",
    github: "https://github.com/kamalbuilds/fluxshare",
    docs: "https://docs.iota.org/",
  },
}
