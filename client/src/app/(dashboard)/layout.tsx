"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  GiftIcon, 
  LayoutDashboardIcon, 
  SearchIcon, 
  MessageSquareTextIcon,
  SettingsIcon,
  CalendarClockIcon, 
  BarChart2Icon, 
  LogOutIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    title: "Niches Setup",
    href: "/niches-setup",
    icon: <LayoutDashboardIcon className="h-5 w-5" />,
  },
  {
    title: "Discovery",
    href: "/discovery",
    icon: <SearchIcon className="h-5 w-5" />,
  },
  {
    title: "Content Generator",
    href: "/content-generator",
    icon: <MessageSquareTextIcon className="h-5 w-5" />,
  },
  {
    title: "Scheduler",
    href: "/scheduler",
    icon: <CalendarClockIcon className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: <BarChart2Icon className="h-5 w-5" />,
  },
];

const otherNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: <SettingsIcon className="h-5 w-5" />,
  },
  {
    title: "Team",
    href: "/team",
    icon: <UsersIcon className="h-5 w-5" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    return (
      <Link href={item.href} passHref>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-2",
            isActive
              ? "bg-muted font-medium"
              : "hover:bg-muted"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {item.icon}
          <span>{item.title}</span>
        </Button>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navbar - mobile */}
      <header className="sticky top-0 z-40 border-b bg-background lg:hidden">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0">
                <SheetHeader className="border-b px-6 py-4">
                  <SheetTitle className="flex items-center gap-2">
                    <GiftIcon className="h-5 w-5 text-primary" />
                    <span>Reddit Affiliate</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-2">
                  {mainNavItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                  <div className="my-2 h-px bg-border" />
                  {otherNavItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <GiftIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">Reddit Affiliate</span>
            </Link>
          </div>
          <ModeToggle />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - desktop */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r bg-background lg:flex">
          <div className="flex h-14 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2">
              <GiftIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">Reddit Affiliate</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            <div className="my-2 h-px bg-border" />
            {otherNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
          <div className="flex items-center justify-between border-t p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div>
                <div className="text-sm font-medium">User</div>
                <div className="text-xs text-muted-foreground">user@example.com</div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-56">
          <div className="container py-6 md:py-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}