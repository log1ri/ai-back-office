import type { Team, ProjectItem } from "../types/sidebar.types";

/**
 * Transforms organization data from API to Team interface
 * @param org - Organization object from API
 * @returns Team object
 * This function maps the organization object to the Team interface,
 * extracting necessary fields and providing defaults for optional ones.
 * It ensures that the returned object conforms to the Team interface.
 * @example
 * transformOrganizationToTeam({ _id: 'org1', organization: 'Org 1', subId: 'sub1' });
 * // Returns { _id: 'org1', name: 'Org 1', logo: '', plan: '', subId: 'sub1', profilePic: '', organization: 'Org 1' }      
 */
export const transformOrganizationToTeam = (org: any): Team => ({
  _id: org._id,
  name: org.organization,
  logo: org.profilePic || "",
  plan: "",
  subId: org.subId || org._id,
  profilePic: org.profilePic,
  organization: org.organization,
});

/**
 * Transforms organizations array to teams array
 * @param organizations - Array of organization objects
 * @returns Array of Team objects
 * This function checks if the input is an array,
 * and maps each organization to a Team object using the transformOrganizationToTeam function.
 * If the input is not an array, it returns an empty array.
 * @example
 * transformOrganizationsToTeams([{ _id: 'org1', organization: 'Org 1', subId: 'sub1' }]);
 * // Returns [{ _id: 'org1', name: 'Org 1', logo: '', plan: '', subId: 'sub1', profilePic: '', organization: 'Org 1' }]    
 */
export const transformOrganizationsToTeams = (organizations: any[]): Team[] => {
  if (!Array.isArray(organizations)) return [];
  return organizations.map(transformOrganizationToTeam);
};

/**
 * Finds team by subId or _id
 * @param teams - Array of teams
 * @param subId - The subId or _id to search for
 * @returns The team object if found, otherwise undefined
 * This function checks each team in the array to see if its subId or _id matches the provided subId.
 * If a match is found, it returns the team object. If no match is found,
 * it returns undefined.
 * @example
 * findTeamBySubId([{ _id: 'team1', name: 'Team 1', subId: 'sub1' }], 'sub1');
 * // Returns { _id: 'team1', name: 'Team 1', subId: 'sub1' }
 * findTeamBySubId([{ _id: 'team2', name: 'Team 2' }], 'team2');
 * // Returns { _id: 'team2', name: 'Team 2' }
 * findTeamBySubId([{ _id: 'team3', name: 'Team 3' }], 'team4');
 * // Returns undefined 
 */
export const findTeamBySubId = (teams: Team[], subId: string): Team | undefined => {
  return teams.find((team) => (team.subId || team._id) === subId);
};

/**
 * Gets the first available team
 * @return The first team or null if none found
 * This function checks if the teams array is not empty
 * and returns the first team object. If the array is empty, it returns null.
 * @example
 * getFirstTeam([{ _id: 'team1', name: 'Team 1'
 * }]); // Returns { _id: 'team1', name: 'Team 1' }
 */
export const getFirstTeam = (teams: Team[]): Team | null => {
  return teams.length > 0 ? teams[0] : null;
};

/**
 * Builds project URLs with services prefix
 * @param projects - Array of project items
 * @param activeTeam - The currently active team
 * @returns Array of project items with updated URLs
 * 
 * This function takes an array of project items and the currently active team,
 * 
 * @example
 * buildProjectUrls([{ name: 'Overview', url: '/overview' }], { _id: 'team1' });
 * Returns [{ name: 'Overview', url: '/ocr-services/team1/overview' }]
 * 
 * @why_need_to_do_this
 * This function ensures that all project URLs are correctly formatted
 * to include {name_of_service} path you can look ont the project Tree for more details (Readme.md at the root).
 * project structure and navigation depend on these URLs being consistent.
 */
export const buildProjectUrls = (projects: ProjectItem[], activeTeam: Team | null): ProjectItem[] => {
  if (!activeTeam) return projects;
  
  const orgId = activeTeam._id;
  return projects.map((project) => {
    let url = project.url;
    let children = project.children || [];

    if (url === '/overview') {
      url = `/ocr-services/${orgId}/overview`;
    } else if (url === '/home') {
      url = `/ocr-services/${orgId}/home`;
    } else if (url === '/issues') {
      url = `/ocr-services/${orgId}/issues`;
    } else if (url === '/api-docs') {
      // Hard code fix for children
      if (children[0]) children[0].url = `/ocr-services/api-docs/usage-examples`;
      if (children[1]) children[1].url = `/ocr-services/api-docs/best-practices`;
      if (children[2]) children[2].url = `/ocr-services/api-docs/changelog`;
    } else {
      url = `/ocr-services/${orgId}${project.url}`;
    }
    
    return {
      ...project,
      url,
      children,
    };
  });
};

/**
 * Generates user initials from name or email
 * @param nameOrEmail - The name or email to extract initials from
 * @returns The initials as a string
 * * This function checks if the input is an email, splits it to get the prefix,
 * and returns the first two characters. If it's a name, it splits by spaces
 * and returns the first letters of the first two words, or the first two characters
 * if it's a single word.
 * 
 * @example
 * getInitials("John Doe"); // "JD"
 * getInitials("jane.doe@example.com"); // "JD"
 */
export const getInitials = (nameOrEmail: string): string => {
  if (!nameOrEmail) return "";
  
  const cleanName = nameOrEmail.trim();
  if (cleanName.includes("@")) {
    const emailPrefix = cleanName.split("@")[0];
    return emailPrefix.slice(0, 2).toUpperCase();
  }
  
  const words = cleanName.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return cleanName.slice(0, 2).toUpperCase();
};

/**
 * Validates team object
 * @param team - The team object to validate
 * @returns true if valid, false otherwise
 * 
 * This function checks if the team object has required properties
 * and returns true if it matches the Team interface.
 * It checks for _id and name as strings, and other properties as optional.
 */
export const isValidTeam = (team: any): team is Team => {
  return (
    team &&
    typeof team === "object" &&
    typeof team._id === "string" &&
    typeof team.name === "string"
  );
};

/**
 * Debounces a function call
 * @param func - The function to debounce
 * @param wait - The debounce delay in milliseconds
 * @returns A debounced version of the function
 * 
 * This function returns a new function that delays the execution of the original function
 * until after wait milliseconds have elapsed since the last time the debounced function was invoked.
 * It uses a closure to maintain the timeout state.
 * @example
 * const debouncedFunction = debounce(() => console.log('Executed!'), 300);
 * debouncedFunction(); // Will log 'Executed!' after 300ms if not called again
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Memoizes a function result
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Checks if the current environment is mobile
 */
export const isMobileEnvironment = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

/**
 * Safely parses JSON with fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};
