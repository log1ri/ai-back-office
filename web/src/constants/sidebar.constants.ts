import { BarChart3, ImageIcon, AlertTriangle, CloudCog, BookOpen, Lightbulb, History, DollarSign  } from "lucide-react";

export const SIDEBAR_CONFIG = {
  DEFAULT_OPEN: true,
  COLLAPSIBLE: 'icon' as const,
  SIDE: 'left' as const,
  VARIANT: 'sidebar' as const,
  COOKIE_NAME: 'sidebar_state',
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7,
  WIDTH: '16rem',
  WIDTH_MOBILE: '18rem',
  WIDTH_ICON: '3rem',
  KEYBOARD_SHORTCUT: 'b',
} as const;

export const PROJECT_NAVIGATION_ITEMS = [
  {
    name: 'Overview',
    url: '/overview',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Image Log',
    url: '/home',
    icon: ImageIcon,
  },
  {
    name: 'Image Issue',
    url: '/issues', // Changed from '/about' to '/issues' for clarity
    icon: AlertTriangle,
  },
  {
    name: 'Price Management',
    url: '/price',
    icon: DollarSign,
  },
  {
    name: 'ApiDocs',
    url: '/api-docs',
    icon: CloudCog ,
    children: [
      {
        name: 'Usage Examples',
        url: '/usage-examples',
        icon: BookOpen,
      },
      {
        name: 'Best Practices',
        url: '/best-practices',
        icon: Lightbulb,
      },
      {
        name: 'Changelog',
        url: '/changelog',
        icon: History,
      }
    ]
  },
] as const;

export const SIDEBAR_LABELS = {
  OCR_SERVICE: 'OCR Service',
  ORGANIZATIONS: 'organizations',
  ADD_ORGANIZATION: 'Add organization',
  LOADING_ORGANIZATIONS: 'Loading organizations...',
  NO_ORGANIZATIONS: 'No organizations',
} as const;

export const USER_MENU_ITEMS = [
  { key: 'upgrade', label: 'Upgrade to Pro', icon: 'Sparkles' },
  { key: 'account', label: 'Account', icon: 'BadgeCheck' },
  { key: 'billing', label: 'Billing', icon: 'CreditCard' },
  { key: 'notifications', label: 'Notifications', icon: 'Bell' },
  { key: 'logout', label: 'Log out', icon: 'LogOut' },
] as const;

export const PROJECT_MENU_ITEMS = [
  { key: 'view', label: 'View Project', icon: 'Folder' },
  { key: 'share', label: 'Share Project', icon: 'Forward' },
  { key: 'delete', label: 'Delete Project', icon: 'Trash2' },
] as const;

export const ANIMATION_CONFIG = {
  TRANSITION_DURATION: 200,
  EASE: 'ease-linear',
  HOVER_DELAY: 100,
} as const;

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
} as const;

export const ICON_SIZES = {
  SM: 'w-4 h-4',
  MD: 'w-5 h-5',
  LG: 'w-6 h-6',
  XL: 'w-8 h-8',
} as const;
