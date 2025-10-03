"use client"

import React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import type { TeamSwitcherProps } from "../../types/sidebar.types";
import { SIDEBAR_LABELS } from "../../constants/sidebar.constants";

const TeamLogo: React.FC<{ team: any; size?: number }> = React.memo(({ team, size = 32 }) => {
  if (typeof team.logo === 'string') {
    return (
      <img
        src={team.logo}
        alt={team.name}
        style={{
          width: size,
          height: size,
          objectFit: 'contain' as const,
          borderRadius: 8,
          background: '#fff'
        }}
      />
    );
  }
  
  return <team.logo className="size-4" />;
});

TeamLogo.displayName = "TeamLogo";

export function TeamSwitcher({
  teams,
  activeTeam,
  setActiveTeam,
  onTeamChange,
}: TeamSwitcherProps) {
  const { isMobile } = useSidebar();
  
  const handleTeamSelect = React.useCallback((team: any) => {
    if (onTeamChange && team._id) {
      onTeamChange(team._id);
    } else {
      setActiveTeam(team);
    }
  }, [onTeamChange, setActiveTeam]);

  if (!activeTeam) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                <TeamLogo team={activeTeam} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {SIDEBAR_LABELS.ORGANIZATIONS}
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team._id || team.name}
                onClick={() => handleTeamSelect(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border overflow-hidden">
                  <TeamLogo team={team} size={24} />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                {SIDEBAR_LABELS.ADD_ORGANIZATION}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
