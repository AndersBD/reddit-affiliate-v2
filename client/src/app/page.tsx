"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RedditThread, ThreadFilterOptions } from "@/lib/types";
import {
  ArrowUpDown,
  BarChart,
  List,
  RefreshCw,
  Search,
  Settings,
  Star
} from "lucide-react";
import FilterPanel from "@/components/FilterPanel";
import OpportunityList from "@/components/OpportunityList";
import ThreadPreviewModal from "@/components/ThreadPreviewModal";

export default function HomePage() {
  const { toast } = useToast();
  const [selectedThread, setSelectedThread] = useState<RedditThread | null>(null);
  const [filters, setFilters] = useState<ThreadFilterOptions>({
    limit: 10,
    offset: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.subreddit) params.append("subreddit", filters.subreddit);
    if (filters.intentType) params.append("intentType", filters.intentType);
    if (filters.serpRank) params.append("serpRank", filters.serpRank);
    if (filters.affiliateProgram) params.append("affiliateProgram", filters.affiliateProgram);
    if (filters.search) params.append("search", filters.search);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDirection) params.append("sortDirection", filters.sortDirection);
    
    return params.toString();
  };

  // Fetch threads
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/threads?${buildQueryString()}`],
  });

  // Stats query
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });

  // Handle refreshing opportunities
  const handleRefreshOpportunities = async () => {
    try {
      setIsRefreshing(true);
      
      const response = await apiRequest('POST', '/api/refresh-opportunities', {});
      const result = await response.json();
      
      toast({
        title: "Opportunities Refreshed",
        description: `Successfully processed ${result.count} thread(s).`,
      });
      
      refetch();
    } catch (error) {
      console.error("Error refreshing opportunities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh opportunities. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle opening the thread preview modal
  const handleThreadClick = (thread: RedditThread) => {
    setSelectedThread(thread);
    setIsModalOpen(true);
  };

  // Handle closing the thread preview modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ThreadFilterOptions>) => {
    setFilters({
      ...filters,
      ...newFilters,
      // Reset pagination when filters change
      offset: 0
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * (filters.limit || 10);
    setFilters({
      ...filters,
      offset: newOffset
    });
  };

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reddit Affiliate Opportunities</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => handleRefreshOpportunities()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Opportunities
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <CardDescription>Opportunities ready for action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : statsData?.totalOpportunities || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Intent Threads</CardTitle>
            <CardDescription>Threads with purchase intent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : statsData?.highIntentCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Google Ranked</CardTitle>
            <CardDescription>Threads in Google top 10</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : statsData?.serpRankedCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">
              <List className="h-4 w-4 mr-2" />
              All Threads
            </TabsTrigger>
            <TabsTrigger value="top-scoring">
              <Star className="h-4 w-4 mr-2" />
              Top Scoring
            </TabsTrigger>
            <TabsTrigger value="google-ranked">
              <Search className="h-4 w-4 mr-2" />
              Google Ranked
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange({ sortBy: undefined })}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Clear Sorting
          </Button>
        </div>
        
        <TabsContent value="all" className="mt-4">
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          
          <OpportunityList 
            isLoading={isLoading}
            error={error}
            data={data}
            onThreadClick={handleThreadClick}
            onPageChange={handlePageChange}
            currentOffset={filters.offset || 0}
            pageSize={filters.limit || 10}
          />
        </TabsContent>
        
        <TabsContent value="top-scoring" className="mt-4">
          <FilterPanel 
            filters={{...filters, sortBy: "score", sortDirection: "desc"}}
            onFilterChange={handleFilterChange}
          />
          
          <OpportunityList 
            isLoading={isLoading}
            error={error}
            data={data}
            onThreadClick={handleThreadClick}
            onPageChange={handlePageChange}
            currentOffset={filters.offset || 0}
            pageSize={filters.limit || 10}
          />
        </TabsContent>
        
        <TabsContent value="google-ranked" className="mt-4">
          <FilterPanel 
            filters={{...filters, serpRank: "Top 10"}}
            onFilterChange={handleFilterChange}
          />
          
          <OpportunityList 
            isLoading={isLoading}
            error={error}
            data={data}
            onThreadClick={handleThreadClick}
            onPageChange={handlePageChange}
            currentOffset={filters.offset || 0}
            pageSize={filters.limit || 10}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium">Analytics Dashboard</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Analytics features coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {selectedThread && (
        <ThreadPreviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          thread={selectedThread}
        />
      )}
    </main>
  );
}