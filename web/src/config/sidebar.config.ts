import type { SidebarConfig, ProjectItem } from "../types/sidebar.types";
import { SIDEBAR_CONFIG, PROJECT_NAVIGATION_ITEMS } from "../constants/sidebar.constants";

/**
 * Default sidebar configuration
 */
export const defaultSidebarConfig: SidebarConfig = {
  defaultOpen: SIDEBAR_CONFIG.DEFAULT_OPEN,
  collapsible: SIDEBAR_CONFIG.COLLAPSIBLE,
  side: SIDEBAR_CONFIG.SIDE,
  variant: SIDEBAR_CONFIG.VARIANT,
};

/**
 * Get project navigation items
 */
// export const getProjectsData = (): ProjectItem[] => {
//   return PROJECT_NAVIGATION_ITEMS.map(item => ({
//     ...item,
//     current: 'current' in item ? item.current : false,
//   }));
// };

export const getProjectsData = (): ProjectItem[] => {
  const mapItem = (item: any): ProjectItem => ({
    ...item,
    current: 'current' in item ? item.current : false,
    children: item.children ? item.children.map(mapItem) : undefined,
  });
  return PROJECT_NAVIGATION_ITEMS.map(mapItem);
};

/**
 * Sidebar theme configuration
 */
export const sidebarTheme = {
  colors: {
    background: 'hsl(var(--sidebar-background))',
    foreground: 'hsl(var(--sidebar-foreground))',
    primary: 'hsl(var(--sidebar-primary))',
    primaryForeground: 'hsl(var(--sidebar-primary-foreground))',
    accent: 'hsl(var(--sidebar-accent))',
    accentForeground: 'hsl(var(--sidebar-accent-foreground))',
    border: 'hsl(var(--sidebar-border))',
    ring: 'hsl(var(--sidebar-ring))',
  },
  spacing: {
    padding: '0.5rem',
    gap: '0.5rem',
    iconSize: '1rem',
  },
  borderRadius: {
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
  },
} as const;

/**
 * Responsive configuration
 */
export const responsiveConfig = {
  mobile: {
    width: SIDEBAR_CONFIG.WIDTH_MOBILE,
    breakpoint: 768,
  },
  desktop: {
    width: SIDEBAR_CONFIG.WIDTH,
    iconWidth: SIDEBAR_CONFIG.WIDTH_ICON,
  },
} as const;
