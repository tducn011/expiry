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
  title: 'Expiry Management System',
  description: 'Hệ thống quản lý hạn sử dụng và luồng chuyển kho',
  language: 'vi',
  robots: {
    index: true,
  },
  accessibility: {
    addBypassLinks: true,
  },
}

export default siteConfig
