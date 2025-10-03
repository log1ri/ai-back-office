import type { LucideIcon } from "lucide-react";

// Base sidebar interfaces
export interface BaseEntity {
  _id: string;
  name: string;
}

// Team/Organization interfaces
export interface Team extends BaseEntity {
  logo: string | LucideIcon;
  plan: string;
  subId?: string;
  profilePic?: string;
  organization?: string;
}

// User interfaces for sidebar
export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
}

// Navigation interfaces
export interface NavigationItem {
  name: string;
  url: string;
  icon: LucideIcon;
  current?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface ProjectItem extends NavigationItem {
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
}

// Sidebar configuration interfaces
export interface SidebarConfig {
  defaultOpen: boolean;
  collapsible: 'offcanvas' | 'icon' | 'none';
  side: 'left' | 'right';
  variant: 'sidebar' | 'floating' | 'inset';
}

// Event handler interfaces
export interface TeamSwitchHandlers {
  onTeamChange: (teamId: string) => void;
  setActiveTeam: (team: Team | null) => void;
}

// Component prop interfaces
export interface TeamSwitcherProps extends TeamSwitchHandlers {
  teams: Team[];
  activeTeam: Team | null;
}

export interface NavProjectsProps {
  projects: ProjectItem[];
}

export interface NavUserProps {
  user: SidebarUser;
}

// State management interfaces
export interface SidebarState {
  activeTeam: Team | null;
  isLoading: boolean;
  error: string | null;
}
