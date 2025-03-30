import * as React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { 
  BarChart2, 
  Calendar, 
  Grid, 
  Home, 
  KeySquare, 
  MessageSquare, 
  PieChart, 
  Settings, 
  Share2
} from "lucide-react";

interface NavItemProps {
  href: string;
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

function NavItem({ href, title, icon, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all cursor-pointer",
        isActive 
          ? "bg-accent text-accent-foreground" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}>
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-4 w-4",
        })}
        {title}
      </div>
    </Link>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [path] = window.location.pathname.split('/').filter(Boolean);
  const currentPath = `/${path || ''}`;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Share2 className="h-5 w-5 text-primary" />
            <span>Reddit Affiliate Engine</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ModeToggle />
            <Button variant="outline" size="sm">
              Schedule Crawler
            </Button>
            <Button size="sm">
              Generate Comment
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-[240px] flex-col border-r bg-muted/40 p-4 md:flex">
          <nav className="grid gap-2 text-sm">
            <NavItem 
              href="/" 
              title="Dashboard" 
              icon={<Home />} 
              isActive={currentPath === "/"} 
            />
            <NavItem 
              href="/subreddits" 
              title="Subreddits" 
              icon={<Grid />} 
              isActive={currentPath === "/subreddits"} 
            />
            <NavItem 
              href="/keywords" 
              title="Keywords" 
              icon={<KeySquare />} 
              isActive={currentPath === "/keywords"} 
            />
            <NavItem 
              href="/opportunities" 
              title="Opportunities" 
              icon={<BarChart2 />} 
              isActive={currentPath === "/opportunities"} 
            />
            <NavItem 
              href="/content" 
              title="Content Generator" 
              icon={<MessageSquare />} 
              isActive={currentPath === "/content"} 
            />
            <NavItem 
              href="/schedule" 
              title="Schedule" 
              icon={<Calendar />} 
              isActive={currentPath === "/schedule"} 
            />
            <NavItem 
              href="/analytics" 
              title="Analytics" 
              icon={<PieChart />} 
              isActive={currentPath === "/analytics"} 
            />
            <NavItem 
              href="/settings" 
              title="Settings" 
              icon={<Settings />} 
              isActive={currentPath === "/settings"} 
            />
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="container py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}