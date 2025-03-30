import * as React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { 
  BarChart2, 
  Calendar, 
  Database,
  Globe,
  Home, 
  Layers,
  RefreshCw,
  Search,
  Settings, 
  Share2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
          ? "bg-accent text-accent-foreground font-medium" 
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
  
  // Track crawler status (this would ideally be fetched from the API)
  const [isRunning, setIsRunning] = React.useState(false);
  
  const handleRunCrawler = async () => {
    // This would make an API call to run the crawler
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000); // Mock for demo purposes
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Share2 className="h-5 w-5 text-primary" />
            <span>Reddit Affiliate Engine</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5 h-8"
              onClick={handleRunCrawler}
              disabled={isRunning}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRunning && "animate-spin")} />
              {isRunning ? "Running..." : "Run Crawler"}
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 flex-col border-r bg-background p-4 md:flex">
          <nav className="grid gap-1 text-sm">
            <NavItem 
              href="/" 
              title="Dashboard" 
              icon={<Home />} 
              isActive={currentPath === "/"} 
            />
            <NavItem 
              href="/opportunities" 
              title="Opportunities" 
              icon={<BarChart2 />} 
              isActive={currentPath === "/opportunities"} 
            />
            <NavItem 
              href="/threads" 
              title="Threads" 
              icon={<Layers />} 
              isActive={currentPath === "/threads"} 
            />
            <NavItem 
              href="/affiliate-programs" 
              title="Affiliate Programs" 
              icon={<Database />} 
              isActive={currentPath === "/affiliate-programs"} 
            />
            <NavItem 
              href="/serp-matches" 
              title="SERP Matches" 
              icon={<Search />} 
              isActive={currentPath === "/serp-matches"} 
            />
            <NavItem 
              href="/scheduler" 
              title="Scheduler" 
              icon={<Calendar />} 
              isActive={currentPath === "/scheduler"} 
            />
            
            <Separator className="my-3" />
            
            <NavItem 
              href="/subreddits" 
              title="Subreddits" 
              icon={<Globe />} 
              isActive={currentPath === "/subreddits"} 
            />
            <NavItem 
              href="/settings" 
              title="Settings" 
              icon={<Settings />} 
              isActive={currentPath === "/settings"} 
            />
          </nav>
          
          <div className="mt-auto pt-4">
            <div className="rounded-lg border bg-card p-3">
              <h4 className="mb-1 text-xs font-medium">Crawler Status</h4>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isRunning ? "bg-green-500" : "bg-amber-500"
                )} />
                <span className="text-xs text-muted-foreground">
                  {isRunning ? "Crawler running" : "Scheduled for next run"}
                </span>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}