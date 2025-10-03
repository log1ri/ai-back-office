import React from "react";
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar";
import { AppSidebar } from "./Sidebar/app-sidebar";
import Header from './Header'; 


const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(
    () => (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')
  );


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header onToggleTheme={toggleTheme} theme={theme} />
        <div className="flex-1 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout; 