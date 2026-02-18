import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { useLocation } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  onToggleTheme?: () => void;
  theme?: 'light' | 'dark';
}

function Header({ onToggleTheme, theme }: HeaderProps) {
  const location = useLocation();
  
  // Helper function to get page name from route
  const getPageName = (pathname: string): string => {
    if (pathname === "/") return "Home";
    if (pathname === "/login") return "Login";
    if (pathname === "/overview") return "Overview";
    if (pathname === "/test") return "Test";
    if (pathname === "/event-tracking-test") return "Event Tracking Test";
    
    // OCR Services routes
    if (pathname.includes("/ocr-services/")) {
      if (pathname.includes("/overview")) return "Overview";
      if (pathname.includes("/sessions")) return "Sessions";
      if (pathname.includes("/home")) return "Image Log";
      if (pathname.includes("/issues")) return "Image Issues";
      if (pathname === "/ocr-services" || pathname === "/ocr-services/") return "OCR Services";
    }
    
    // Default fallback
    return "Overview";
  };

  // Helper function to get organization name from URL params
  const getOrgName = (pathname: string): string | null => {
    const match = pathname.match(/\/ocr-services\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const pageName = getPageName(location.pathname);
  const orgId = getOrgName(location.pathname);
  
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 justify-between w-full">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="h-7 flex items-center translate-y-[6px]">
            <Breadcrumb>
              <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">
                  AI Back Office
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              {/* Show organization level if we're in OCR services */}
              {orgId && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={`/ocr-services/${orgId}/overview`}>
                      OCR Services
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{pageName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        {/* Dark mode toggle button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="ml-auto p-2 rounded hover:bg-muted transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
