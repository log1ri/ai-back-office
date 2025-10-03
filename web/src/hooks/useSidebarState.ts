import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import type { Team, SidebarState } from "../types/sidebar.types";
import { 
  transformOrganizationsToTeams, 
  findTeamBySubId, 
  getFirstTeam,
  debounce
} from "../utils/sidebar.utils";
import { useOrganizations } from "./useOrganizations";
import { useSubIdContext } from "../contexts/SubIdContext";
import { useOrganizationCacheManager } from "../utils/organization-cache.utils";

/**
 * Custom hook for managing sidebar team state
 */
export const useSidebarTeams = () => {
  const organizationsQuery = useOrganizations();
  const { subId, setSubId } = useSubIdContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const { invalidateOrganizationCache, prefetchOrganizationData } = useOrganizationCacheManager();

  // Memoize teams transformation
  const teams = useMemo(() => {
    return transformOrganizationsToTeams(organizationsQuery.data || []);
  }, [organizationsQuery.data]);

  // Update active team when teams or subId changes
  useEffect(() => {
    if (teams.length === 0) return;

    const currentTeam = findTeamBySubId(teams, subId);
    if (currentTeam) {
      setActiveTeam(currentTeam);
    } else if (!activeTeam) {
      const firstTeam = getFirstTeam(teams);
      if (firstTeam) {
        setActiveTeam(firstTeam);
      }
    }
  }, [teams, subId, activeTeam]);

  // Debounced team change handler with proper routing and cache invalidation
  const handleTeamChange = useCallback(
    debounce(async (newSubId: string) => {
      const selectedTeam = findTeamBySubId(teams, newSubId);
      if (selectedTeam) {
        console.log('Team changing from', subId, 'to', newSubId);
        
        // Update active team immediately for UI responsiveness
        setActiveTeam(selectedTeam);
        
        // Update the SubId context
        setSubId(newSubId);
        
        // Invalidate all queries related to the old organization
        if (subId && subId !== 'default') {
          console.log('Invalidating cache for old organization:', subId);
          await invalidateOrganizationCache(subId);
        }
        
        // Prefetch/invalidate queries for the new organization to ensure fresh data
        console.log('Setting up cache for new organization:', newSubId);
        await Promise.all([
          invalidateOrganizationCache(newSubId),
          prefetchOrganizationData(newSubId)
        ]);
        
        // Determine the current route and preserve it when switching teams
        const currentPath = location.pathname;
        let targetRoute = '/overview'; // default
        
        // Extract the current route from OCR services path
        if (currentPath.includes('/ocr-services/')) {
          const pathSegments = currentPath.split('/');
          const routeIndex = pathSegments.indexOf('ocr-services') + 2; // Skip 'ocr-services' and orgId
          if (routeIndex < pathSegments.length) {
            targetRoute = `/${pathSegments[routeIndex]}`;
          }
        }
        
        // Navigate to the new organization with the same route
        const newPath = `/ocr-services/${newSubId}${targetRoute}`;
        console.log('Team changed, navigating to:', newPath);
        
        try {
          navigate({ to: newPath });
        } catch (error) {
          console.error('Navigation error during team change:', error);
          // Fallback to window location
          window.location.href = newPath;
        }
      }
    }, 100),
    [teams, navigate, location.pathname, subId, setSubId, invalidateOrganizationCache, prefetchOrganizationData]
  );

  const sidebarState: SidebarState = {
    activeTeam,
    isLoading: organizationsQuery.isLoading,
    error: organizationsQuery.error?.message || null,
  };

  return {
    teams,
    activeTeam,
    setActiveTeam,
    handleTeamChange,
    sidebarState,
    organizationsQuery,
  };
};

/**
 * Custom hook for managing sidebar visibility and state
 */
export const useSidebarState = (defaultOpen = true) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return {
    isOpen,
    isMobileOpen,
    setIsOpen,
    setIsMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
  };
};

/**
 * Custom hook for managing project navigation state
 */
export const useProjectNavigation = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return {
    isExpanded,
    setIsExpanded,
    toggleExpanded,
  };
};
