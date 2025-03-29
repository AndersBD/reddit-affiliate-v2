import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isMobileOpen: boolean;
}

export default function Sidebar({ isMobileOpen }: SidebarProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Default subreddits to crawl
  const defaultSubreddits = [
    "SaaS", 
    "Entrepreneur", 
    "startups", 
    "passive_income", 
    "affiliatemarketing", 
    "bloggers", 
    "juststart"
  ];

  // Mutation for running the crawler
  const runCrawlerMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      return apiRequest("POST", "/api/run-crawler", { subreddits: defaultSubreddits });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      toast({
        title: "Crawler started",
        description: `Crawling ${data.subreddits.length} subreddits. This might take a few minutes.`,
      });
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to start crawler",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const handleRunCrawler = () => {
    runCrawlerMutation.mutate();
  };

  const displayClasses = isMobileOpen 
    ? "flex flex-col w-64 fixed inset-y-0 z-50 bg-white border-r border-neutral-200 md:relative md:flex md:flex-shrink-0" 
    : "hidden md:flex md:flex-shrink-0";

  return (
    <div id="sidebar" className={displayClasses}>
      <div className="flex flex-col w-64 bg-white border-r border-neutral-200">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <h1 className="text-xl font-semibold text-neutral-800">
            <span className="text-primary">Reddit</span> Affiliate
          </h1>
        </div>
        
        <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
          <div className="px-4 mb-4">
            <Button 
              id="runCrawlerBtn" 
              className="w-full flex items-center justify-center"
              onClick={handleRunCrawler}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? "Running..." : "Run Crawler"}
            </Button>
          </div>
          
          <div className="px-4 space-y-1">
            <Link href="/" className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === "/" 
                  ? "text-primary bg-neutral-100" 
                  : "text-neutral-600 hover:text-primary hover:bg-neutral-100"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                  location === "/" ? "text-primary" : "text-neutral-500 group-hover:text-primary"
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
            </Link>
            <Link href="/opportunities" className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === "/opportunities" 
                  ? "text-primary bg-neutral-100" 
                  : "text-neutral-600 hover:text-primary hover:bg-neutral-100"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                  location === "/opportunities" ? "text-primary" : "text-neutral-500 group-hover:text-primary"
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Opportunities
            </Link>
            <Link href="/settings" className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === "/settings" 
                  ? "text-primary bg-neutral-100" 
                  : "text-neutral-600 hover:text-primary hover:bg-neutral-100"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                  location === "/settings" ? "text-primary" : "text-neutral-500 group-hover:text-primary"
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
            </Link>
            <Link href="/history" className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === "/history" 
                  ? "text-primary bg-neutral-100" 
                  : "text-neutral-600 hover:text-primary hover:bg-neutral-100"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                  location === "/history" ? "text-primary" : "text-neutral-500 group-hover:text-primary"
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Crawl History
            </Link>
            <Link href="/programs" className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === "/programs" 
                  ? "text-primary bg-neutral-100" 
                  : "text-neutral-600 hover:text-primary hover:bg-neutral-100"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                  location === "/programs" ? "text-primary" : "text-neutral-500 group-hover:text-primary"
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Affiliate Programs
            </Link>
          </div>
        </nav>
        
        <div className="flex-shrink-0 p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                JD
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700">John Doe</p>
              <p className="text-xs font-medium text-neutral-500">Solo affiliate marketer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
