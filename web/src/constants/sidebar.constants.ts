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
    current: false,
  },
  {
    name: 'Sessions',
    url: '/sessions',
  },
  {
    name: 'Image Log',
    url: '/home',
  },
  {
    name: 'Image Issue',
    url: '/issues',
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
  { key: 'logout', label: 'Log out', icon: 'LogOut' },
] as const;

export const PROJECT_MENU_ITEMS = [] as const;

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
