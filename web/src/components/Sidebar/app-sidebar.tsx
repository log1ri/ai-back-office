import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar";
import { QueryLoadingWrapper } from "../ui/loading-wrapper";
import { useAuth } from "../../contexts/AuthContext";
import { TeamSwitcher } from "./team-switcher";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { useSidebarTeams } from "../../hooks/useSidebarState";
import { defaultSidebarConfig, getProjectsData } from "../../config/sidebar.config";
import { buildProjectUrls } from "../../utils/sidebar.utils";
import { SIDEBAR_LABELS } from "../../constants/sidebar.constants";
import type { SidebarUser } from "../../types/sidebar.types";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const {
    teams,
    activeTeam,
    setActiveTeam,
    handleTeamChange,
    organizationsQuery,
  } = useSidebarTeams();

  // const nav xitem
  const projectsWithUrls = React.useMemo(() => {
    const projectsData = getProjectsData();
    return buildProjectUrls(projectsData, activeTeam);
  }, [activeTeam]);

  const sidebarUser: SidebarUser | null = React.useMemo(() => {
    if (!user) return null;
    return {
      name: user.name,
      email: user.email,  
      avatar: "",
    };
  }, [user]);

  return (
    <Sidebar 
      collapsible={defaultSidebarConfig.collapsible} 
      {...props}
    >
      <SidebarHeader>
        <QueryLoadingWrapper
          query={organizationsQuery}
          loadingText={SIDEBAR_LABELS.LOADING_ORGANIZATIONS}
          emptyMessage={SIDEBAR_LABELS.NO_ORGANIZATIONS}
        >
          {() => (
            <TeamSwitcher
              teams={teams}
              activeTeam={activeTeam}
              setActiveTeam={setActiveTeam}
              onTeamChange={handleTeamChange}
            />
          )}
        </QueryLoadingWrapper>
      </SidebarHeader>

      <SidebarContent>
        <NavProjects projects={projectsWithUrls} />
      </SidebarContent>

      <SidebarFooter>
        {sidebarUser && <NavUser user={sidebarUser} />}
      </SidebarFooter>
    </Sidebar>
  );
}
