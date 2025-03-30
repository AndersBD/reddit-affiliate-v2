import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  FilterX,
  Globe,
  Info,
  Loader2,
  MessageSquare,
  RefreshCw,
  RocketIcon,
  Search,
  SlidersHorizontal,
} from "lucide-react";

// Types
interface Thread {
  id: number;
  title: string;
  subreddit: string;
  url: string;
  upvotes: number;
  commentCount: number;
  crawledAt: string;
}

interface Opportunity {
  id: number;
  threadId: number;
  score: number;
  intent: string | null;
  matchedProgramIds: number[];
  serpMatch: boolean;
  action: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AffiliateProgram {
  id: number;
  name: string;
  website: string;
  commission: string;
  category: string;
  keywords: string[];
  description: string;
}

interface Filters {
  subreddit: string;
  intent: string;
  minScore: number;
}

// Main component
function OpportunitiesPage() {
  // State for filters
  const [filters, setFilters] = React.useState<Filters>({
    subreddit: "",
    intent: "",
    minScore: 0,
  });

  // State for sorting
  const [sortBy, setSortBy] = React.useState<{
    field: keyof Opportunity | keyof Thread;
    direction: "asc" | "desc";
  }>({
    field: "score",
    direction: "desc",
  });

  // State for selected opportunity to view in drawer
  const [selectedOpportunity, setSelectedOpportunity] = React.useState<number | null>(null);

  // Define response types
  type OpportunitiesResponse = { opportunities: Opportunity[] };
  type ThreadsResponse = { threads: Thread[] };
  
  // Fetch opportunities
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery<OpportunitiesResponse>({
    queryKey: ["/api/opportunities"],
    staleTime: 30 * 1000,
  });

  // Fetch threads
  const { data: threadsData, isLoading: threadsLoading } = useQuery<ThreadsResponse>({
    queryKey: ["/api/threads"],
    staleTime: 30 * 1000,
  });

  // Fetch affiliate programs
  const { data: affiliateProgramsData, isLoading: programsLoading } = useQuery<AffiliateProgram[]>({
    queryKey: ["/api/affiliate-programs"],
    staleTime: 5 * 60 * 1000,
  });

  // Extract data
  const opportunities: Opportunity[] = opportunitiesData?.opportunities || [];
  const threads: Thread[] = threadsData?.threads || [];
  const affiliatePrograms: AffiliateProgram[] = affiliateProgramsData || [];

  // Run crawler function
  const runCrawler = async () => {
    try {
      // Start crawler job
      setIsCrawlerRunning(true);
      console.log("Running crawler...");
      await apiRequest("POST", "/api/run-crawler");
      
      // Refresh opportunities with the new data
      console.log("Refreshing opportunities...");
      await apiRequest("POST", "/api/refresh-opportunities");
      
      // Invalidate all related queries to fetch latest data
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/serp-results"] });
      
      setTimeout(() => {
        setIsCrawlerRunning(false);
        console.log("Crawler and opportunity refresh completed");
      }, 2000);
    } catch (error) {
      console.error("Failed to run crawler:", error);
      setIsCrawlerRunning(false);
    }
  };

  // Refresh opportunities function
  const refreshOpportunities = async () => {
    try {
      setIsRefreshing(true);
      await apiRequest("POST", "/api/refresh-opportunities");
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      setTimeout(() => {
        setIsRefreshing(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to refresh opportunities:", error);
      setIsRefreshing(false);
    }
  };
  
  // State for loading indicators
  const [isCrawlerRunning, setIsCrawlerRunning] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Get unique subreddits for filter
  const uniqueSubreddits = React.useMemo(() => {
    const subreddits = threads.map((thread) => thread.subreddit);
    return Array.from(new Set(subreddits));
  }, [threads]);

  // Get unique intent types for filter
  const uniqueIntents = React.useMemo(() => {
    const intents = opportunities
      .map((opp) => opp.intent)
      .filter((intent): intent is string => intent !== null);
    return Array.from(new Set(intents));
  }, [opportunities]);

  // Filter opportunities
  const filteredOpportunities = React.useMemo(() => {
    return opportunities.filter((opp) => {
      const thread = threads.find((t) => t.id === opp.threadId);
      if (!thread) return false;

      // Apply filters
      if (filters.subreddit && thread.subreddit !== filters.subreddit) return false;
      if (filters.intent && opp.intent !== filters.intent) return false;
      if (filters.minScore && opp.score < filters.minScore) return false;

      return true;
    });
  }, [opportunities, threads, filters]);

  // Sort opportunities
  const sortedOpportunities = React.useMemo(() => {
    return [...filteredOpportunities].sort((a, b) => {
      let valA, valB;

      if (sortBy.field === "score" || sortBy.field === "intent" || 
          sortBy.field === "matchedProgramIds" || sortBy.field === "serpMatch") {
        valA = a[sortBy.field];
        valB = b[sortBy.field];
      } else {
        // For thread fields
        const threadA = threads.find((t) => t.id === a.threadId);
        const threadB = threads.find((t) => t.id === b.threadId);
        
        if (!threadA || !threadB) return 0;
        
        valA = threadA[sortBy.field as keyof Thread];
        valB = threadB[sortBy.field as keyof Thread];
      }

      // Special case for arrays (matchedProgramIds)
      if (Array.isArray(valA) && Array.isArray(valB)) {
        valA = valA.length;
        valB = valB.length;
      }

      // Handle string comparisons
      if (typeof valA === "string" && typeof valB === "string") {
        return sortBy.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Handle numeric/boolean comparisons
      return sortBy.direction === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [filteredOpportunities, sortBy, threads]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      subreddit: "",
      intent: "",
      minScore: 0,
    });
  };

  // Handle sort
  const handleSort = (field: keyof Opportunity | keyof Thread) => {
    setSortBy({
      field,
      direction: sortBy.field === field && sortBy.direction === "desc" ? "asc" : "desc",
    });
  };

  // Find selected opportunity details
  const selectedOpportunityDetails = React.useMemo(() => {
    if (selectedOpportunity === null) return null;

    const opportunity = opportunities.find((o) => o.id === selectedOpportunity);
    if (!opportunity) return null;

    const thread = threads.find((t) => t.id === opportunity.threadId);
    if (!thread) return null;

    // Get matched programs
    const matchedPrograms = affiliatePrograms.filter((program) =>
      opportunity.matchedProgramIds.includes(program.id)
    );

    return {
      opportunity,
      thread,
      matchedPrograms,
    };
  }, [selectedOpportunity, opportunities, threads, affiliatePrograms]);

  const isLoading = opportunitiesLoading || threadsLoading || programsLoading;

  // Calculate score brackets for stats
  const scoreStats = React.useMemo(() => {
    const high = filteredOpportunities.filter(o => o.score >= 70).length;
    const medium = filteredOpportunities.filter(o => o.score >= 40 && o.score < 70).length;
    const low = filteredOpportunities.filter(o => o.score < 40).length;
    
    return { high, medium, low, total: filteredOpportunities.length };
  }, [filteredOpportunities]);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
            <p className="text-muted-foreground">
              Discover and manage Reddit affiliate marketing opportunities
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={runCrawler}
              disabled={isCrawlerRunning}
            >
              {isCrawlerRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {isCrawlerRunning ? "Running Crawler..." : "Run Crawler"}
            </Button>
            <Button
              variant="default"
              className="gap-1.5"
              onClick={refreshOpportunities}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRefreshing ? "Refreshing..." : "Refresh Opportunities"}
            </Button>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="md:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filters</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={resetFilters}
                >
                  <FilterX className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </Button>
              </div>
              <CardDescription>
                Filter opportunities based on subreddit, intent, and score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-[180px]">
                  <p className="mb-2 text-sm font-medium">Subreddit</p>
                  <Select value={filters.subreddit || "all"} onValueChange={(value) => setFilters((prev) => ({ ...prev, subreddit: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Subreddits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subreddits</SelectItem>
                      {uniqueSubreddits.map((subreddit) => (
                        <SelectItem key={subreddit} value={subreddit}>
                          r/{subreddit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[180px]">
                  <p className="mb-2 text-sm font-medium">Intent</p>
                  <Select value={filters.intent || "all"} onValueChange={(value) => setFilters((prev) => ({ ...prev, intent: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Intents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Intents</SelectItem>
                      {uniqueIntents.map((intent) => (
                        <SelectItem key={intent} value={intent}>
                          {intent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Minimum Score</p>
                    <span className="text-xs text-muted-foreground">
                      {filters.minScore}
                    </span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[filters.minScore]}
                      max={100}
                      step={5}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, minScore: value[0] }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Stats</CardTitle>
              <CardDescription>
                Opportunity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total:</span>
                  <Badge variant="outline" className="font-mono">
                    {scoreStats.total}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Value:</span>
                  <Badge className="bg-green-500 font-mono">
                    {scoreStats.high}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium Value:</span>
                  <Badge className="bg-amber-500 font-mono">
                    {scoreStats.medium}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Value:</span>
                  <Badge className="bg-slate-500 font-mono">
                    {scoreStats.low}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Opportunities</CardTitle>
            <CardDescription>
              List of potential Reddit threads for affiliate marketing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sortedOpportunities.length === 0 ? (
              <div className="flex h-[400px] w-full flex-col items-center justify-center">
                <div className="mb-4 rounded-full bg-muted p-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No opportunities found</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Try adjusting your filters or run the crawler to find more opportunities
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <Button onClick={runCrawler}>Run Crawler</Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center gap-1">
                          Thread Title
                          {sortBy.field === "title" && (
                            <ArrowUpDown className={cn(
                              "h-3.5 w-3.5 text-muted-foreground",
                              sortBy.direction === "asc" && "rotate-180"
                            )} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort("subreddit")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Subreddit
                          {sortBy.field === "subreddit" && (
                            <ArrowUpDown className={cn(
                              "h-3.5 w-3.5 text-muted-foreground",
                              sortBy.direction === "asc" && "rotate-180"
                            )} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort("score")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Score
                          {sortBy.field === "score" && (
                            <ArrowUpDown className={cn(
                              "h-3.5 w-3.5 text-muted-foreground",
                              sortBy.direction === "asc" && "rotate-180"
                            )} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort("intent")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Intent
                          {sortBy.field === "intent" && (
                            <ArrowUpDown className={cn(
                              "h-3.5 w-3.5 text-muted-foreground",
                              sortBy.direction === "asc" && "rotate-180"
                            )} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center"
                        onClick={() => handleSort("matchedProgramIds")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Affiliate Matches
                          {sortBy.field === "matchedProgramIds" && (
                            <ArrowUpDown className={cn(
                              "h-3.5 w-3.5 text-muted-foreground",
                              sortBy.direction === "asc" && "rotate-180"
                            )} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">SERP</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOpportunities.map((opportunity) => {
                      const thread = threads.find((t) => t.id === opportunity.threadId);
                      if (!thread) return null;

                      // Get matched programs
                      const matchedPrograms = affiliatePrograms.filter((program) =>
                        opportunity.matchedProgramIds.includes(program.id)
                      );

                      return (
                        <TableRow key={opportunity.id}>
                          <TableCell className="max-w-[300px] font-medium">
                            <div className="flex items-start gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={thread.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="line-clamp-2 hover:text-primary hover:underline"
                                    >
                                      {thread.title}
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" align="start" className="max-w-xs">
                                    {thread.title}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">r/{thread.subreddit}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              className={cn(
                                "font-mono",
                                opportunity.score >= 70 ? "bg-green-500" : 
                                opportunity.score >= 40 ? "bg-amber-500" : 
                                "bg-slate-500"
                              )}
                            >
                              {opportunity.score}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {opportunity.intent ? (
                              <Badge variant="secondary">
                                {opportunity.intent}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {matchedPrograms.length > 0 ? (
                                <>
                                  {matchedPrograms.slice(0, 2).map((program) => (
                                    <TooltipProvider key={program.id}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge 
                                            variant="outline" 
                                            className="hover:bg-accent"
                                          >
                                            {program.name}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          {program.description}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                  {matchedPrograms.length > 2 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge 
                                            variant="outline" 
                                            className="hover:bg-accent"
                                          >
                                            +{matchedPrograms.length - 2}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          {matchedPrograms.slice(2).map((p) => p.name).join(", ")}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {opportunity.serpMatch ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Check className="mx-auto h-4 w-4 text-green-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    This thread ranks in Google search results
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-1">
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    aria-label="View details"
                                    onClick={() => setSelectedOpportunity(opportunity.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-xl">
                                  {selectedOpportunityDetails && (
                                    <OpportunityDetails 
                                      opportunity={selectedOpportunityDetails.opportunity}
                                      thread={selectedOpportunityDetails.thread}
                                      matchedPrograms={selectedOpportunityDetails.matchedPrograms}
                                    />
                                  )}
                                </SheetContent>
                              </Sheet>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {sortedOpportunities.length} of {opportunities.length} opportunities
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Opportunity Details Component for Drawer
interface OpportunityDetailsProps {
  opportunity: Opportunity;
  thread: Thread;
  matchedPrograms: AffiliateProgram[];
}

function OpportunityDetails({ opportunity, thread, matchedPrograms }: OpportunityDetailsProps) {
  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle>Opportunity Details</SheetTitle>
        <SheetDescription>
          View and analyze opportunity data
        </SheetDescription>
      </SheetHeader>

      {/* Thread Details */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Thread Information</h3>
        <div className="rounded-md border p-4 space-y-3">
          <h4 className="font-medium">{thread.title}</h4>
          
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm">
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>r/{thread.subreddit}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>{thread.commentCount} comments</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span>{thread.upvotes} upvotes</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Crawled: {formatDate(new Date(thread.crawledAt))}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <a
              href={thread.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Eye className="h-3.5 w-3.5" />
              View on Reddit
            </a>
          </div>
        </div>
      </div>

      {/* Opportunity Score Breakdown */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Opportunity Score</h3>
        <div className="rounded-md border">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Score</span>
              <Badge 
                className={cn(
                  "font-mono",
                  opportunity.score >= 70 ? "bg-green-500" : 
                  opportunity.score >= 40 ? "bg-amber-500" : 
                  "bg-slate-500"
                )}
              >
                {opportunity.score}
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <ScoreItem
              title="Intent Classification"
              value={opportunity.intent ? 25 : 0}
              description={`Intent: ${opportunity.intent || 'Unknown'}`}
            />
            <ScoreItem
              title="Affiliate Program Matches"
              value={opportunity.matchedProgramIds.length > 0 ? 30 : 0}
              description={`${opportunity.matchedProgramIds.length} program${opportunity.matchedProgramIds.length !== 1 ? 's' : ''}`}
            />
            <ScoreItem
              title="SERP Ranking"
              value={opportunity.serpMatch ? 20 : 0}
              description={opportunity.serpMatch ? "Ranks in Google" : "Not ranking in SERP"}
            />
            <ScoreItem
              title="Engagement Score"
              value={thread.upvotes > 50 ? 10 : 5}
              description={`${thread.upvotes} upvotes, ${thread.commentCount} comments`}
            />
          </div>
        </div>
      </div>

      {/* Matched Programs */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Matched Affiliate Programs</h3>
        {matchedPrograms.length > 0 ? (
          <div className="rounded-md border divide-y">
            {matchedPrograms.map((program) => (
              <div key={program.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{program.name}</h4>
                  <Badge variant="outline">{program.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{program.description}</p>
                <div className="flex flex-wrap gap-2">
                  {program.keywords.slice(0, 5).map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {program.keywords.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{program.keywords.length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1 text-sm">
                  <span className="text-muted-foreground">Commission: {program.commission}</span>
                  <a
                    href={program.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Visit Website
                    <RocketIcon className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border p-6">
            <AlertCircle className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No affiliate programs matched</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Score Item Component for the Opportunity Details
interface ScoreItemProps {
  title: string;
  value: number;
  description: string;
}

function ScoreItem({ title, value, description }: ScoreItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{title} contribution to final score</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Badge variant="outline" className="font-mono">
          +{value}
        </Badge>
      </div>
    </div>
  );
}

export default OpportunitiesPage;