import { useState } from "react";
import React from "react";
import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import type { NavProjectsProps } from "../../types/sidebar.types";
import { useProjectNavigation } from "../../hooks/useSidebarState";
import { SIDEBAR_LABELS, PROJECT_MENU_ITEMS } from "../../constants/sidebar.constants";

const ProjectMenuItem: React.FC<{ item: any }> = React.memo(({ item }) => {
  const [open, setOpen] = useState(false);
  const { isMobile } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === item.url;
  const hasChildren = item.children && item.children.length > 0;


  return (
<SidebarMenuItem key={item.name}>
  <>
    {/* menu item
    <SidebarMenuButton asChild isActive={isActive}>
      <Link to={item.url}>
        <item.icon />
        <span>{item.name}</span>
      </Link>
    </SidebarMenuButton>
    */}
    

    <SidebarMenuButton
      asChild
      isActive={isActive}
      onClick={hasChildren ? () => setOpen((prev) => !prev) : undefined}
    >

      
      {/* check children */}
      {hasChildren ? (
        // 
        <button
          type="button"
          className="flex items-center justify-between w-full cursor-pointer bg-transparent border-none px-2 py-2"
        >
          <div className="flex items-center">
            {/* icon */}
            <item.icon className="w-4 h-4  ml-2" />
            <span className="ml-2 ">{item.name}</span>
          </div>
            {item.name === "ApiDocs" && (
    open ? <ChevronDown className="w-4 h-4 ml-28" /> : <ChevronRight className="w-4 h-4 ml-28" />
  )}

        </button>

      ) : (
        <Link to={item.url} className='flex items-center'>
            <item.icon className="w-5 h-5 ml-2"/>
            <span>{item.name}</span>
        </Link>
      )}
    </SidebarMenuButton>

    {/* check children */}
    {hasChildren && open && (
      <SidebarMenu>
        {item.children.map((child: any) => (
          <div className="ml-6" key={child.name}>
            <ProjectMenuItem
              item={{
                ...child,
                icon: (props: any) => (
                  <child.icon {...props} className="w-4 h-4 opacity-75 mr-2" />
                ),
                name: (
                  <span className="text-[0.95em] font-[350]">{child.name}</span>
                ),
              }}
            />
          </div>
        ))}
      </SidebarMenu>
    )}

    {item.name !== "ApiDocs" && (
    <DropdownMenu>
      {/* <DropdownMenuTrigger asChild>
        <SidebarMenuAction showOnHover>
          {item.name === "ApiDocs"
            ? (open
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />)
            : <MoreHorizontal />}
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger> */}

      <DropdownMenuTrigger asChild>
      <SidebarMenuAction showOnHover>
        <MoreHorizontal />
        <span className="sr-only">More</span>
      </SidebarMenuAction>
    </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-48 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      >
        {PROJECT_MENU_ITEMS.slice(0, 2).map((menuItem) => (
          <DropdownMenuItem key={menuItem.key}>
            {menuItem.key === 'view' && <Folder className="text-muted-foreground" />}
            {menuItem.key === 'share' && <Forward className="text-muted-foreground" />}
            <span>{menuItem.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Trash2 className="text-muted-foreground" />
          <span>{PROJECT_MENU_ITEMS[2].label}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    )}
  </>
</SidebarMenuItem>
  );
});

ProjectMenuItem.displayName = "ProjectMenuItem";

export function NavProjects({ projects = [] }: NavProjectsProps) {
  const { isExpanded, toggleExpanded } = useProjectNavigation();

  const groupLabelStyle = React.useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    justifyContent: 'space-between',
  }), []);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel
        style={groupLabelStyle}
        onClick={toggleExpanded}
      >
        <span style={{ flex: 1 }}>{SIDEBAR_LABELS.OCR_SERVICE}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </SidebarGroupLabel>
      <SidebarMenu>
        {isExpanded && projects.map((item) => (
          <ProjectMenuItem key={item.name} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
