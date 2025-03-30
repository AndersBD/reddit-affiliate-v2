import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadPreviewModal } from "@/components/discovery/ThreadPreviewModal";
import {
  MoreHorizontalIcon,
  ExternalLinkIcon,
  MessageSquarePlusIcon,
  StarIcon,
  StarHalfIcon,
  TrashIcon,
  FileTextIcon,
  CalendarIcon,
  ArrowDownIcon,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import { cn } from "@/lib/utils";

interface Thread {
  id: number;
  title: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  commentCount: number;
  createdAt: string;
  content?: string;
}

interface Opportunity {
  id: number;
  threadId: number;
  thread: Thread;
  affiliateProgram: string;
  intentScore: number;
  matchScore: number;
  totalScore: number;
  keywords: string[];
  status: "identified" | "reviewing" | "approved" | "rejected";
  serpPosition?: number;
  createdAt: string;
}

interface OpportunityListProps {
  opportunities: Opportunity[];
  isLoading: boolean;
}

export function OpportunityList({ opportunities, isLoading }: OpportunityListProps) {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Delete opportunity mutation
  const deleteOpportunityMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/opportunities/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "Success",
        description: "Opportunity deleted successfully",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/opportunities/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "Success",
        description: "Opportunity status updated",
      });
    },
  });

  // Generate comment mutation
  const generateCommentMutation = useMutation({
    mutationFn: (opportunityId: number) => {
      return apiRequest(`/api/generate-comment`, {
        method: "POST",
        body: JSON.stringify({ opportunityId }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment generated and saved",
      });
    },
  });

  // Open thread preview
  const openThreadPreview = (thread: Thread) => {
    setSelectedThread(thread);
    setIsModalOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "identified":
        return <Badge variant="secondary">Identified</Badge>;
      case "reviewing":
        return <Badge variant="outline">Reviewing</Badge>;
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Get opportunity score display
  const getScoreDisplay = (score: number) => {
    const color = score >= 80
      ? "text-green-500"
      : score >= 60
      ? "text-amber-500"
      : "text-muted-foreground";
    
    const icon = score >= 80
      ? <StarIcon className="h-4 w-4" />
      : <StarHalfIcon className="h-4 w-4" />;
    
    return (
      <div className="flex items-center gap-1">
        <span className={cn("font-medium", color)}>
          {score}
        </span>
        <span className={color}>{icon}</span>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Affiliate Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Thread</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">SERP Position</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Identified
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : opportunities.length > 0 ? (
                  opportunities.map((opportunity) => (
                    <TableRow key={opportunity.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span
                            className="truncate max-w-[300px] cursor-pointer hover:text-primary"
                            onClick={() => openThreadPreview(opportunity.thread)}
                          >
                            {opportunity.thread.title}
                          </span>
                          <div className="flex items-center mt-1">
                            <Badge variant="secondary">
                              {opportunity.thread.subreddit}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-2">
                              {opportunity.thread.commentCount} comments
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {opportunity.affiliateProgram}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          {getScoreDisplay(opportunity.totalScore)}
                          <Progress
                            value={opportunity.totalScore}
                            className="h-1 w-16"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {opportunity.serpPosition ? (
                          <Badge variant={opportunity.serpPosition <= 10 ? "success" : "secondary"}>
                            #{opportunity.serpPosition}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not checked</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(opportunity.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDistance(new Date(opportunity.createdAt), new Date(), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openThreadPreview(opportunity.thread)}
                              className="cursor-pointer"
                            >
                              <FileTextIcon className="mr-2 h-4 w-4" />
                              View Thread
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(opportunity.thread.url, '_blank')}
                              className="cursor-pointer"
                            >
                              <ExternalLinkIcon className="mr-2 h-4 w-4" />
                              Open on Reddit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => generateCommentMutation.mutate(opportunity.id)}
                              className="cursor-pointer"
                              disabled={generateCommentMutation.isPending}
                            >
                              <MessageSquarePlusIcon className="mr-2 h-4 w-4" />
                              Generate Comment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ 
                                id: opportunity.id, 
                                status: "approved" 
                              })}
                              className="cursor-pointer"
                              disabled={
                                opportunity.status === "approved" ||
                                updateStatusMutation.isPending
                              }
                            >
                              <StarIcon className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ 
                                id: opportunity.id, 
                                status: "rejected" 
                              })}
                              className="cursor-pointer"
                              disabled={
                                opportunity.status === "rejected" ||
                                updateStatusMutation.isPending
                              }
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No opportunities found. Try analyzing threads to find opportunities.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {opportunities.length} opportunities found
          </div>
          {opportunities.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowDownIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Thread Preview Modal */}
      {selectedThread && (
        <ThreadPreviewModal
          thread={selectedThread}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}