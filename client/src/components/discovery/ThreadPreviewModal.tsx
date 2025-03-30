import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ExternalLinkIcon, 
  ArrowUpIcon, 
  MessageSquareIcon,
  CalendarIcon,
  UserIcon
} from "lucide-react";
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
  content?: string;
}

interface ThreadPreviewModalProps {
  thread: Thread;
  isOpen: boolean;
  onClose: () => void;
}

export function ThreadPreviewModal({ thread, isOpen, onClose }: ThreadPreviewModalProps) {
  // Fetch thread content if not already available
  const { data, isLoading } = useQuery({
    queryKey: [`/api/threads/${thread.id}`], 
    enabled: isOpen && !thread.content,
  });
  
  // Get the thread content from either props or fetched data
  const threadContent = thread.content || (data?.content || '');
  
  // Get thread comments if available
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/threads/${thread.id}/comments`],
    enabled: isOpen,
  });
  
  // Get thread opportunities if available
  const { data: opportunities } = useQuery({
    queryKey: [`/api/threads/${thread.id}/opportunities`],
    enabled: isOpen,
  });
  
  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{thread.title}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline">r/{thread.subreddit}</Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              {thread.score}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquareIcon className="h-3 w-3 mr-1" />
              {thread.commentCount}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDistance(new Date(thread.createdAt), new Date(), { addSuffix: true })}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <UserIcon className="h-3 w-3 mr-1" />
              {thread.author}
            </div>
          </div>
        </DialogHeader>
        
        <Separator className="my-2" />
        
        <div className="flex-1 overflow-y-auto px-1">
          {/* Thread Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: threadContent }} />
            )}
          </div>
          
          <Separator className="my-4" />
          
          {/* Opportunities Section */}
          {opportunities && opportunities.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Detected Opportunities</h3>
                <div className="space-y-2">
                  {opportunities.map((opportunity: any) => (
                    <div 
                      key={opportunity.id} 
                      className="p-3 rounded-md border bg-muted/40"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{opportunity.affiliateProgram}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {opportunity.keywords.map((keyword: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Score: {opportunity.totalScore}</p>
                          <p className="text-xs text-muted-foreground">
                            Intent: {opportunity.intentScore} | Match: {opportunity.matchScore}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="my-4" />
            </>
          )}
          
          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-medium mb-2">Top Comments</h3>
            {isLoadingComments ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {comments.slice(0, 5).map((comment: any, idx: number) => (
                  <AccordionItem value={`comment-${idx}`} key={idx}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.score} points
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: comment.content }} 
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground">No comments available</p>
            )}
          </div>
        </div>
        
        <Separator className="mt-2" />
        
        <DialogFooter className="flex justify-between sm:justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">
              ID: {thread.id}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => window.open(thread.url, '_blank')}
              className="gap-1"
            >
              <ExternalLinkIcon className="h-4 w-4" />
              View on Reddit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}