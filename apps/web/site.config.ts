export interface SiteConfig {
  title?: string

  description?: string

  language?: string

  robots?: {
    index?: boolean
  }

  icons?: {
    icon?: string
  }

  openGraph?: {
    image?: string
  }

  analytics?: {
    googleAnalyticsId?: string
  }

  customScripts?: {
    headStart?: string

    headEnd?: string

    bodyStart?: string

    bodyEnd?: string
  }

  accessibility?: {
    addBypassLinks?: boolean
  }
}

export const siteConfig: SiteConfig = {
  title: "Expiry",

  language: "vi",

  robots: {
    index: true,
  },

  icons: {
    icon: "favicon.svg",
  },

  accessibility: {
    addBypassLinks: true,
  },
}

export default siteConfig
