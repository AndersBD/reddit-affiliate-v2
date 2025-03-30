import React from "react";
import { RedditThread } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MessageSquare,
  ArrowUpFromLine,
  Tag,
  Calendar,
  TrendingUp,
  BarChart3,
  Users
} from "lucide-react";

interface OpportunityListProps {
  isLoading: boolean;
  error: Error | null | unknown;
  data: { threads: RedditThread[]; total: number } | undefined;
  onThreadClick: (thread: RedditThread) => void;
  onPageChange: (page: number) => void;
  currentOffset: number;
  pageSize: number;
}

export default function OpportunityList({
  isLoading,
  error,
  data,
  onThreadClick,
  onPageChange,
  currentOffset,
  pageSize,
}: OpportunityListProps) {
  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="text-destructive flex items-center text-lg">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading the opportunities. Please try again later or contact support.
          </p>
          <p className="text-xs mt-2 font-mono text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (!data || !data.threads || data.threads.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">No Opportunities Found</CardTitle>
          <CardDescription>Try adjusting your filters or check back later</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn't find any Reddit threads matching your criteria. Try broadening your search 
            or check back after the next crawler run.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { threads, total } = data;
  const currentPage = Math.floor(currentOffset / pageSize) + 1;
  const totalPages = Math.ceil(total / pageSize);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Function to format link
  const formatPermalink = (permalink: string) => {
    return `https://reddit.com${permalink}`;
  };

  // Function to generate intent badge variant
  const getIntentVariant = (intentType: string | undefined) => {
    switch (intentType) {
      case "QUESTION": return "default";
      case "COMPARISON": return "secondary";
      case "REVIEW": return "outline";
      case "RECOMMENDATION": return "destructive";
      case "DISCOVERY": return "default";
      default: return "secondary";
    }
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Showing {currentOffset + 1} - {Math.min(currentOffset + threads.length, total)} of {total} opportunities
      </div>
      
      {threads.map((thread) => (
        <Card key={thread.id} className="overflow-hidden hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium leading-tight">
              {truncateText(thread.title, 100)}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs">
              <Users className="h-3 w-3" />
              <span>r/{thread.subreddit}</span>
              <span>•</span>
              <span>{thread.author}</span>
              <span>•</span>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(thread.createdAt)}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">
              {truncateText(thread.body, 200)}
            </p>
          </CardContent>
          
          <CardFooter className="pt-2 flex justify-between flex-wrap gap-2">
            <div className="flex flex-wrap gap-1.5">
              {thread.intentType && (
                <Badge variant={getIntentVariant(thread.intentType)}>
                  {thread.intentType}
                </Badge>
              )}
              
              <Badge variant="outline" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Score: {thread.score}
              </Badge>
              
              {thread.hasSerp && thread.serpRank && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  SERP: #{thread.serpRank}
                </Badge>
              )}
              
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {thread.commentCount}
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1">
                <ArrowUpFromLine className="h-3 w-3" />
                {thread.upvotes}
              </Badge>
              
              {thread.matchedKeywords && thread.matchedKeywords.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {thread.matchedKeywords.length} keyword{thread.matchedKeywords.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onThreadClick(thread)}
            >
              View Thread
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          
          <Button
            variant="outline" 
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}