"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCcwIcon, 
  FilterIcon,
  ArrowUpDownIcon,
  RedditIcon,
  SearchIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThreadList } from "@/components/discovery/ThreadList";
import { FilterPanel } from "@/components/discovery/FilterPanel";
import { OpportunityList } from "@/components/discovery/OpportunityList";

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState("threads");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  
  // Fetch threads
  const { 
    data: threads, 
    isLoading: isLoadingThreads,
    refetch: refetchThreads
  } = useQuery({
    queryKey: ['/api/threads'],
  });
  
  // Fetch opportunities
  const { 
    data: opportunities, 
    isLoading: isLoadingOpportunities,
    refetch: refetchOpportunities
  } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  // Trigger crawler function
  const runCrawler = async () => {
    try {
      toast({
        title: "Starting crawler",
        description: "The crawler is now running in the background",
      });
      
      await apiRequest('/api/run-crawler', {
        method: 'POST',
      });
      
      toast({
        title: "Crawler started",
        description: "New threads will appear shortly",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start the crawler",
        variant: "destructive",
      });
    }
  };

  // Handle refresh opportunities
  const refreshOpportunities = async () => {
    try {
      toast({
        title: "Refreshing opportunities",
        description: "Analyzing threads for new opportunities",
      });
      
      await apiRequest('/api/refresh-opportunities', {
        method: 'POST',
      });
      
      refetchOpportunities();
      
      toast({
        title: "Refresh complete",
        description: "Opportunities have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh opportunities",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thread Discovery</h1>
          <p className="text-muted-foreground mt-2">
            Discover and analyze Reddit threads for affiliate marketing opportunities
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FilterIcon className="h-4 w-4" />
            Filters
          </Button>
          
          <Button 
            onClick={runCrawler}
            className="flex items-center gap-2"
          >
            <RedditIcon className="h-4 w-4" />
            Run Crawler
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 gap-6">
        {showFilters && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium">Filter Options</CardTitle>
            </CardHeader>
            <CardContent>
              <FilterPanel onFilterChange={() => {}} />
            </CardContent>
          </Card>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="threads" className="flex items-center gap-1">
              <SearchIcon className="h-4 w-4" />
              Reddit Threads
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-1">
              <ArrowUpDownIcon className="h-4 w-4" />
              Opportunities
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="threads" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchThreads()}
                className="flex items-center gap-1"
              >
                <RefreshCcwIcon className="h-3 w-3" />
                Refresh
              </Button>
            </div>
            
            <ThreadList 
              threads={threads || []}
              isLoading={isLoadingThreads}
            />
          </TabsContent>
          
          <TabsContent value="opportunities" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshOpportunities}
                className="flex items-center gap-1 mr-2"
              >
                <RefreshCcwIcon className="h-3 w-3" />
                Analyze Threads
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchOpportunities()}
                className="flex items-center gap-1"
              >
                <RefreshCcwIcon className="h-3 w-3" />
                Refresh
              </Button>
            </div>
            
            <OpportunityList 
              opportunities={opportunities || []}
              isLoading={isLoadingOpportunities}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}