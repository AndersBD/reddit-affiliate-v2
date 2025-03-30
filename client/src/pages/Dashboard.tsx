import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, BarChart2, RefreshCw, TrendingUp, Users } from "lucide-react";
import { formatDate, formatNumber, truncateText } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

// Helper function to fetch dashboard data
interface DashboardStats {
  totalThreads: number;
  totalOpportunities: number;
  averageScore: number;
  conversionsEstimate: number;
}

// Types
interface Thread {
  id: number;
  title: string;
  subreddit: string;
  upvotes: number;
  commentCount: number;
  crawledAt: string;
  score?: number;
  intentType?: string | null;
}

interface Opportunity {
  id: number;
  threadId: number;
  thread?: Thread;
  score: number;
  intent: string | null;
  createdAt: string;
  action: string | null;
}

interface ThreadsResponse {
  threads: Thread[];
  total: number;
  limit: number;
  offset: number;
}

interface OpportunitiesResponse {
  opportunities: Opportunity[];
  total: number;
  limit: number;
  offset: number;
}

function DashboardPage() {
  // Fetch threads
  const { data: threadsData, isLoading: threadsLoading } = useQuery<ThreadsResponse>({
    queryKey: ['/api/threads'],
    staleTime: 60 * 1000,
  });

  // Fetch opportunities
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery<OpportunitiesResponse>({
    queryKey: ['/api/opportunities'],
    staleTime: 60 * 1000,
  });

  // Extract threads and opportunities arrays from the response
  const threads = threadsData?.threads || [];
  const opportunities = opportunitiesData?.opportunities || [];

  // Calculate dashboard stats
  const stats: DashboardStats = React.useMemo(() => {
    if (threads.length === 0 || opportunities.length === 0) {
      return {
        totalThreads: threads.length,
        totalOpportunities: opportunities.length,
        averageScore: 0,
        conversionsEstimate: 0,
      };
    }
    
    const totalThreads = threads.length;
    const totalOpportunities = opportunities.length;
    
    // Calculate average score of opportunities
    const totalScore = opportunities.reduce((acc, opp) => acc + opp.score, 0);
    const averageScore = totalOpportunities > 0 ? totalScore / totalOpportunities : 0;
    
    // Estimate potential conversions (simplified calculation)
    const conversionsEstimate = Math.round(totalOpportunities * (averageScore / 100) * 0.05);
    
    return {
      totalThreads,
      totalOpportunities,
      averageScore,
      conversionsEstimate,
    };
  }, [threads, opportunities]);
  
  // Handle refresh opportunities
  const handleRefreshOpportunities = async () => {
    try {
      await apiRequest('POST', '/api/refresh-opportunities');
      // Invalidate queries to refresh data
      // queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      // queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
    } catch (error) {
      console.error('Failed to refresh opportunities:', error);
    }
  };

  // Get top opportunities
  const topOpportunities = React.useMemo(() => {
    if (!opportunities || !Array.isArray(opportunities)) return [];
    return [...opportunities]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [opportunities]);

  // Get recent threads
  const recentThreads = React.useMemo(() => {
    if (!threads || !Array.isArray(threads)) return [];
    return [...threads]
      .sort((a, b) => new Date(b.crawledAt).getTime() - new Date(a.crawledAt).getTime())
      .slice(0, 5);
  }, [threads]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
        <Button 
          onClick={handleRefreshOpportunities}
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Opportunities
        </Button>
      </div>
      
      {/* Metrics Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Threads" 
          value={stats.totalThreads} 
          description="Crawled from Reddit" 
          icon={<Users />}
          trendValue="+12%"
        />
        <MetricCard 
          title="Total Opportunities" 
          value={stats.totalOpportunities} 
          description="Discovered potential" 
          icon={<BarChart2 />}
          trendValue="+5%"
        />
        <MetricCard 
          title="Average Score" 
          value={stats.averageScore.toFixed(1)} 
          description="Opportunity quality" 
          icon={<TrendingUp />}
          trendValue="+2.4%"
        />
        <MetricCard 
          title="Est. Conversions" 
          value={stats.conversionsEstimate} 
          description="Potential monthly" 
          icon={<ArrowUpRight />}
          trendValue="+3.1%"
        />
      </div>

      {/* Tabs for Opportunities and Threads */}
      <Tabs defaultValue="opportunities" className="mt-6">
        <TabsList>
          <TabsTrigger value="opportunities">Top Opportunities</TabsTrigger>
          <TabsTrigger value="threads">Recent Threads</TabsTrigger>
        </TabsList>
        
        <TabsContent value="opportunities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Highest Scoring Opportunities</CardTitle>
              <CardDescription>Top affiliate opportunities based on intent and score</CardDescription>
            </CardHeader>
            <CardContent>
              {opportunitiesLoading ? (
                <div className="flex justify-center p-4">Loading opportunities...</div>
              ) : topOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {topOpportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} threads={threads || []} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No opportunities found</p>
                  <Button variant="outline" onClick={handleRefreshOpportunities} className="mt-2">
                    Generate Opportunities
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="threads" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Crawled Threads</CardTitle>
              <CardDescription>Latest threads from Reddit</CardDescription>
            </CardHeader>
            <CardContent>
              {threadsLoading ? (
                <div className="flex justify-center p-4">Loading threads...</div>
              ) : recentThreads.length > 0 ? (
                <div className="space-y-4">
                  {recentThreads.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No threads found</p>
                  <Button variant="outline" className="mt-2">
                    Run Crawler
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trendValue?: string;
}

function MetricCard({ title, value, description, icon, trendValue }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</h3>
              {trendValue && (
                <span className="text-xs font-medium text-green-500">{trendValue}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-md bg-primary/10 p-2">
            {React.cloneElement(icon as React.ReactElement, {
              className: "h-5 w-5 text-primary",
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OpportunityCard({ opportunity, threads }: { opportunity: Opportunity, threads: Thread[] }) {
  // Find the thread that this opportunity is associated with
  const thread = threads.find(t => t.id === opportunity.threadId) || opportunity.thread;
  
  if (!thread) {
    return null;
  }
  
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{truncateText(thread.title, 80)}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>r/{thread.subreddit}</span>
            <span>•</span>
            <span>Score: {opportunity.score}</span>
            {opportunity.intent && (
              <>
                <span>•</span>
                <span>Intent: {opportunity.intent}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={`rounded-full px-2 py-1 text-xs font-medium ${opportunity.score > 70 ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : opportunity.score > 40 ? 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'}`}>
            {opportunity.score > 70 ? 'High' : opportunity.score > 40 ? 'Medium' : 'Low'}
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm">
          View Thread
        </Button>
        <Button size="sm">
          Generate Comment
        </Button>
      </div>
    </div>
  );
}

function ThreadCard({ thread }: { thread: Thread }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-medium">{truncateText(thread.title, 80)}</h3>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <span>r/{thread.subreddit}</span>
        <span>•</span>
        <span>{thread.upvotes} upvotes</span>
        <span>•</span>
        <span>{thread.commentCount} comments</span>
        <span>•</span>
        <span>Crawled: {formatDate(new Date(thread.crawledAt))}</span>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm">
          View Thread
        </Button>
        <Button variant="outline" size="sm">
          Check Opportunity
        </Button>
      </div>
    </div>
  );
}

export default DashboardPage;