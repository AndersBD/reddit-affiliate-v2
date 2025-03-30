import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadPreviewModal } from "@/components/discovery/ThreadPreviewModal";
import { 
  MoreHorizontalIcon, 
  ExternalLinkIcon, 
  ZapIcon, 
  FileCheckIcon,
  FileTextIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  MessageSquareIcon,
  CalendarIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

interface Thread {
  id: number;
  title: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  commentCount: number;
  createdAt: string;
  processed: boolean;
  nsfw: boolean;
  content?: string;
}

interface ThreadListProps {
  threads: Thread[];
  isLoading: boolean;
}

export function ThreadList({ threads, isLoading }: ThreadListProps) {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Process single thread
  const processThread = async (threadId: number) => {
    try {
      toast({
        title: "Processing thread",
        description: "Analyzing for affiliate opportunities",
      });
      
      await apiRequest(`/api/threads/${threadId}/process`, {
        method: 'POST',
      });
      
      toast({
        title: "Thread processed",
        description: "Thread has been analyzed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process thread",
        variant: "destructive",
      });
    }
  };
  
  // Check SERP position
  const checkSerpPosition = async (threadId: number) => {
    try {
      toast({
        title: "Checking SERP position",
        description: "This may take a moment",
      });
      
      await apiRequest(`/api/check-serp-position`, {
        method: 'POST',
        body: JSON.stringify({ threadId }),
      });
      
      toast({
        title: "SERP check complete",
        description: "Google position data has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check SERP position",
        variant: "destructive",
      });
    }
  };

  // Open thread preview
  const openThreadPreview = (thread: Thread) => {
    setSelectedThread(thread);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Reddit Threads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Thread Title</TableHead>
                  <TableHead>Subreddit</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                      Score
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <MessageSquareIcon className="h-4 w-4 mr-1" />
                      Comments
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Age
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
                    </TableRow>
                  ))
                ) : threads.length > 0 ? (
                  threads.map((thread) => (
                    <TableRow key={thread.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span 
                            className="truncate max-w-[400px] cursor-pointer hover:text-primary"
                            onClick={() => openThreadPreview(thread)}
                          >
                            {thread.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {thread.author}
                            {thread.nsfw && (
                              <Badge 
                                variant="outline" 
                                className="ml-2 text-xs py-0 h-4"
                              >
                                NSFW
                              </Badge>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {thread.subreddit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{thread.score}</TableCell>
                      <TableCell className="text-center">{thread.commentCount}</TableCell>
                      <TableCell className="text-center">
                        {formatDistance(new Date(thread.createdAt), new Date(), { addSuffix: true })}
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
                              onClick={() => openThreadPreview(thread)}
                              className="cursor-pointer"
                            >
                              <FileTextIcon className="mr-2 h-4 w-4" />
                              View Thread
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(thread.url, '_blank')}
                              className="cursor-pointer"
                            >
                              <ExternalLinkIcon className="mr-2 h-4 w-4" />
                              Open on Reddit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => processThread(thread.id)}
                              className="cursor-pointer"
                              disabled={thread.processed}
                            >
                              <ZapIcon className="mr-2 h-4 w-4" />
                              Find Opportunities
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => checkSerpPosition(thread.id)}
                              className="cursor-pointer"
                            >
                              <FileCheckIcon className="mr-2 h-4 w-4" />
                              Check SERP Position
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No threads found. Run the crawler to fetch new threads.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {threads.length} threads found
          </div>
          {threads.length > 0 && (
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