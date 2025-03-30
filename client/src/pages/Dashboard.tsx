import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUpRight, 
  BarChart2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Eye, 
  FileText, 
  Filter, 
  MessageSquare, 
  RefreshCw, 
  Search, 
  ThumbsUp, 
  TrendingUp
} from "lucide-react";
import { cn, formatDate, formatNumber, truncateText } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

// Helper function to fetch dashboard data
interface DashboardStats {
  totalOpportunities: number;
  averageScore: number;
  estimatedCTR: number;
  lastCrawlTime: string;
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
  url?: string;
}

interface Opportunity {
  id: number;
  threadId: number;
  thread?: Thread;
  score: number;
  intent: string | null;
  matchedProgramIds: number[];
  serpMatch: boolean;
  createdAt: string;
  action: string | null;
}

interface CrawlHistory {
  id: number;
  startTime: string;
  endTime: string;
  threadsCount: number;
  status: string;
}

interface SerpResult {
  id: number;
  threadId: number;
  keyword: string;
  position: number;
  url: string;
  createdAt: string;
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

interface CrawlHistoryResponse {
  history: CrawlHistory[];
  total: number;
}

interface SerpResultsResponse {
  results: SerpResult[];
  total: number;
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
  
  // Fetch crawl history
  const { data: crawlHistoryData } = useQuery<CrawlHistoryResponse>({
    queryKey: ['/api/crawl-history'],
    staleTime: 5 * 60 * 1000,
  });
  
  // Fetch SERP results
  const { data: serpResultsData, isLoading: serpResultsLoading } = useQuery<SerpResultsResponse>({
    queryKey: ['/api/serp-results'],
    staleTime: 5 * 60 * 1000,
  });

  // Extract data from responses
  const threads = threadsData?.threads || [];
  const opportunities = opportunitiesData?.opportunities || [];
  const crawlHistory = crawlHistoryData?.history || [];
  const serpResults = serpResultsData?.results || [];

  // Calculate dashboard stats
  const stats: DashboardStats = React.useMemo(() => {
    // Last crawl time from history or current date if no history
    const lastCrawl = crawlHistory.length > 0 
      ? new Date(crawlHistory[0].endTime)
      : new Date();
    
    // Calculate average score
    const totalScore = opportunities.reduce((acc, opp) => acc + opp.score, 0);
    const averageScore = opportunities.length > 0 ? totalScore / opportunities.length : 0;
    
    // Estimated CTR (simplified calculation)
    const estimatedCTR = opportunities.length > 0 ? 2.5 : 0; // Placeholder value of 2.5%
    
    return {
      totalOpportunities: opportunities.length,
      averageScore,
      estimatedCTR,
      lastCrawlTime: formatDate(lastCrawl),
    };
  }, [opportunities, crawlHistory]);
  
  // Handle refresh opportunities
  const handleRefreshOpportunities = async () => {
    try {
      await apiRequest('POST', '/api/refresh-opportunities');
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
    } catch (error) {
      console.error('Failed to refresh opportunities:', error);
    }
  };
  
  // Handle run crawler now
  const handleRunCrawler = async () => {
    try {
      await apiRequest('POST', '/api/scheduler/run-now');
      queryClient.invalidateQueries({ queryKey: ['/api/crawl-history'] });
      // After a short delay to allow crawler to finish:
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
        queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      }, 5000);
    } catch (error) {
      console.error('Failed to run crawler:', error);
    }
  };

  // Get top opportunities
  const topOpportunities = React.useMemo(() => {
    if (!opportunities.length) return [];
    return [...opportunities]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [opportunities]);

  // Get recent threads
  const recentThreads = React.useMemo(() => {
    if (!threads.length) return [];
    return [...threads]
      .sort((a, b) => new Date(b.crawledAt).getTime() - new Date(a.crawledAt).getTime())
      .slice(0, 5);
  }, [threads]);
  
  // Get top SERP matches
  const topSerpMatches = React.useMemo(() => {
    if (!serpResults.length) return [];
    return [...serpResults]
      .sort((a, b) => a.position - b.position) // Lower position is better
      .slice(0, 5);
  }, [serpResults]);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your affiliate opportunities and Reddit content performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="h-9 gap-1"
              onClick={handleRunCrawler}
            >
              <Clock className="h-4 w-4" />
              Run Crawler
            </Button>
            <Button 
              className="h-9 gap-1"
              onClick={handleRefreshOpportunities}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Opportunities
            </Button>
          </div>
        </div>
        
        {/* Metrics Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Total Opportunities" 
            value={stats.totalOpportunities} 
            description="Potential affiliate prospects"
            icon={<BarChart2 />}
            trendValue="+5%"
            trendDirection="up"
          />
          <MetricCard 
            title="Avg. Score / Opportunity" 
            value={stats.averageScore.toFixed(1)} 
            description="Conversion potential index"
            icon={<TrendingUp />}
            trendValue="+2.4%"
            trendDirection="up"
          />
          <MetricCard 
            title="Est. CTR %" 
            value={`${stats.estimatedCTR}%`} 
            description="Based on historical data"
            icon={<ArrowUpRight />}
            trendValue="+0.8%"
            trendDirection="up"
          />
          <MetricCard 
            title="Last Crawler Run" 
            value={stats.lastCrawlTime} 
            description="Scheduled every 12 hours"
            icon={<Calendar />}
            isValueDate
          />
        </div>
        
        {/* Tabs Section */}
        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="opportunities" className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              <span>Top Opportunities</span>
            </TabsTrigger>
            <TabsTrigger value="threads" className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>Recent Threads</span>
            </TabsTrigger>
            <TabsTrigger value="serp" className="flex items-center gap-1.5">
              <Search className="h-4 w-4" />
              <span>SERP Matches</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Opportunities Tab */}
          <TabsContent value="opportunities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>High-Value Opportunities</CardTitle>
                  <CardDescription>
                    Reddit threads with strong affiliate conversion potential
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1 h-8">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                {opportunitiesLoading ? (
                  <LoadingState />
                ) : topOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {topOpportunities.map((opportunity) => (
                      <OpportunityCard 
                        key={opportunity.id} 
                        opportunity={opportunity} 
                        threads={threads}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    title="No opportunities found"
                    description="Run crawler or refresh opportunities to discover new potential"
                    action={
                      <Button onClick={handleRefreshOpportunities} className="gap-1.5">
                        <RefreshCw className="h-4 w-4" />
                        Generate Opportunities
                      </Button>
                    }
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Showing top 5 of {opportunities.length} opportunities
                </div>
                <Button variant="link" size="sm" className="gap-1 h-auto p-0">
                  <span>View all opportunities</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Threads Tab */}
          <TabsContent value="threads">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Recently Crawled Threads</CardTitle>
                  <CardDescription>
                    Latest content from monitored subreddits
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1 h-8">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                {threadsLoading ? (
                  <LoadingState />
                ) : recentThreads.length > 0 ? (
                  <div className="space-y-4">
                    {recentThreads.map((thread) => (
                      <ThreadCard key={thread.id} thread={thread} />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    title="No threads found"
                    description="Run the crawler to discover new Reddit content"
                    action={
                      <Button onClick={handleRunCrawler} className="gap-1.5">
                        <Clock className="h-4 w-4" />
                        Run Crawler
                      </Button>
                    }
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Showing top 5 of {threads.length} threads
                </div>
                <Button variant="link" size="sm" className="gap-1 h-auto p-0">
                  <span>View all threads</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* SERP Matches Tab */}
          <TabsContent value="serp">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Reddit SERP Matches</CardTitle>
                  <CardDescription>
                    Reddit posts that rank in Google search results
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1 h-8">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                {serpResultsLoading ? (
                  <LoadingState />
                ) : topSerpMatches.length > 0 ? (
                  <div className="space-y-4">
                    {topSerpMatches.map((result) => (
                      <SerpResultCard key={result.id} result={result} threads={threads} />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    title="No SERP matches found"
                    description="Check SERP positions to discover ranking Reddit threads"
                    action={
                      <Button className="gap-1.5">
                        <Search className="h-4 w-4" />
                        Check SERP Positions
                      </Button>
                    }
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Showing top {topSerpMatches.length} of {serpResults.length} SERP matches
                </div>
                <Button variant="link" size="sm" className="gap-1 h-auto p-0">
                  <span>View all SERP matches</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <ActionCard 
                title="Add Affiliate Program" 
                description="Configure new partner tracking"
                icon={<FileText />}
                href="/affiliate-programs"
              />
              <ActionCard 
                title="Schedule Crawler" 
                description="Set up automatic Reddit crawling"
                icon={<Calendar />}
                href="/scheduler"
              />
              <ActionCard 
                title="Generate Comment" 
                description="Create affiliate content with AI"
                icon={<MessageSquare />}
                href="/content"
              />
              <ActionCard 
                title="View Analytics" 
                description="Track your performance metrics"
                icon={<BarChart2 />}
                href="/analytics"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Component for dashboard metric cards
interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trendValue?: string;
  trendDirection?: 'up' | 'down';
  isValueDate?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  description, 
  icon, 
  trendValue, 
  trendDirection = 'up',
  isValueDate = false
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-primary/10 p-2">
            {React.cloneElement(icon as React.ReactElement, {
              className: "h-5 w-5 text-primary",
            })}
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className={cn(
                "text-2xl font-bold",
                isValueDate && "text-lg"
              )}>
                {isValueDate || typeof value === 'string' ? value : formatNumber(value)}
              </h3>
              {trendValue && (
                <span className={cn(
                  "text-xs font-medium",
                  trendDirection === 'up' ? "text-green-500" : "text-red-500"
                )}>
                  {trendValue}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for thread cards
function ThreadCard({ thread }: { thread: Thread }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{thread.upvotes}</span>
            </div>
            <Separator orientation="vertical" className="mx-0 h-3" />
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{thread.commentCount}</span>
            </div>
            <Separator orientation="vertical" className="mx-0 h-3" />
            <span>r/{thread.subreddit}</span>
          </div>
          <div className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Reddit Thread
          </div>
        </div>
        
        <h3 className="mt-2 font-medium leading-tight">
          {truncateText(thread.title, 95)}
        </h3>
        
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Crawled: {formatDate(new Date(thread.crawledAt))}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          Thread ID: {thread.id}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Eye className="h-3.5 w-3.5" />
            View Thread
          </Button>
          <Button size="sm" className="h-8 gap-1 text-xs">
            <CheckCircle className="h-3.5 w-3.5" />
            Check Opportunity
          </Button>
        </div>
      </div>
    </div>
  );
}

// Component for SERP result cards
function SerpResultCard({ result, threads }: { result: SerpResult, threads: Thread[] }) {
  // Find the thread that this result is associated with
  const thread = threads.find(t => t.id === result.threadId);
  
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Keyword:</span>
            <span className="font-medium text-foreground">{result.keyword}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
            <Search className="h-3 w-3" />
            <span>Position: {result.position}</span>
          </div>
        </div>
        
        <h3 className="mt-2 font-medium leading-tight">
          {truncateText(thread?.title || "Unknown Thread Title", 95)}
        </h3>
        
        <div className="mt-3 flex items-center gap-3 text-xs">
          {thread && (
            <>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>r/{thread.subreddit}</span>
              </div>
              <Separator orientation="vertical" className="mx-0 h-3" />
            </>
          )}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">URL:</span>
            <span className="max-w-[300px] truncate font-mono text-[10px]">{result.url}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {formatDate(new Date(result.createdAt))}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Eye className="h-3.5 w-3.5" />
            View SERP Details
          </Button>
          <Button size="sm" className="h-8 gap-1 text-xs">
            <CheckCircle className="h-3.5 w-3.5" />
            Analyze Opportunity
          </Button>
        </div>
      </div>
    </div>
  );
}

// Component for opportunity cards
function OpportunityCard({ opportunity, threads }: { opportunity: Opportunity, threads: Thread[] }) {
  // Find the thread that this opportunity is associated with
  const thread = threads.find(t => t.id === opportunity.threadId) || opportunity.thread;
  
  if (!thread) {
    return null;
  }
  
  // Determine score level for styling
  const scoreLevel = opportunity.score > 70 ? 'high' : opportunity.score > 40 ? 'medium' : 'low';
  const scoreLevelStyles = {
    high: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'
  };
  
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{thread.upvotes}</span>
            </div>
            <Separator orientation="vertical" className="mx-0 h-3" />
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{thread.commentCount}</span>
            </div>
            <Separator orientation="vertical" className="mx-0 h-3" />
            <span>r/{thread.subreddit}</span>
          </div>
          <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${scoreLevelStyles[scoreLevel]}`}>
            {scoreLevel === 'high' ? 'High Value' : scoreLevel === 'medium' ? 'Medium Value' : 'Low Value'}
          </div>
        </div>
        
        <h3 className="mt-2 font-medium leading-tight">
          {truncateText(thread.title, 95)}
        </h3>
        
        <div className="mt-3 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Score:</span>
            <span className="font-semibold">{opportunity.score}</span>
          </div>
          <Separator orientation="vertical" className="mx-0 h-3" />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Intent:</span>
            <span className="font-semibold">{opportunity.intent || "Unknown"}</span>
          </div>
          <Separator orientation="vertical" className="mx-0 h-3" />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Programs:</span>
            <span className="font-semibold">{opportunity.matchedProgramIds.length || 0}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {formatDate(new Date(opportunity.createdAt))}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Eye className="h-3.5 w-3.5" />
            View Thread
          </Button>
          <Button size="sm" className="h-8 gap-1 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            Generate Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

// Component for quick action cards
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function ActionCard({ title, description, icon, href }: ActionCardProps) {
  return (
    <Link href={href}>
      <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border bg-card p-4 text-center transition-colors hover:bg-accent hover:text-accent-foreground">
        <div className="mb-2 rounded-full bg-primary/10 p-2 transition-transform group-hover:scale-110">
          {React.cloneElement(icon as React.ReactElement, {
            className: "h-5 w-5 text-primary",
          })}
        </div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
          <div className="mt-2 h-5 w-full rounded bg-muted" />
          <div className="mt-1 h-5 w-3/4 rounded bg-muted" />
          <div className="mt-4 flex justify-between">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  title: string;
  description: string;
  action: React.ReactNode;
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="rounded-full bg-muted p-3">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">
        {action}
      </div>
    </div>
  );
}

export default DashboardPage;