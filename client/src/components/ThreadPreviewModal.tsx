import React from "react";
import { RedditThread } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowUpFromLine,
  MessageSquare,
  Calendar,
  Link2,
  TrendingUp,
  Tag,
  Lightbulb,
  BarChart3,
  CheckCircle,
  User,
  Search,
} from "lucide-react";

interface ThreadPreviewModalProps {
  isOpen: boolean;
  thread: RedditThread;
  onClose: () => void;
}

export default function ThreadPreviewModal({
  isOpen,
  thread,
  onClose,
}: ThreadPreviewModalProps) {
  const { toast } = useToast();
  const [isGeneratingComment, setIsGeneratingComment] = React.useState(false);
  const [generatedComment, setGeneratedComment] = React.useState("");

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Handle generate comment
  const handleGenerateComment = async () => {
    setIsGeneratingComment(true);
    setGeneratedComment("");

    try {
      const response = await apiRequest("POST", "/api/generate-comment", {
        threadId: thread.id,
        affiliateProgramId: 1, // Default to first program for now
        templateId: 1, // Default to first template for now
      });

      const result = await response.json();
      setGeneratedComment(result.comment);

      toast({
        title: "Comment Generated",
        description: "Affiliate comment successfully generated",
      });
    } catch (error) {
      console.error("Error generating comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate comment. Please try again.",
      });
    } finally {
      setIsGeneratingComment(false);
    }
  };

  // Handle copy comment
  const handleCopyComment = () => {
    if (generatedComment) {
      navigator.clipboard.writeText(generatedComment);
      toast({
        title: "Comment Copied",
        description: "Comment copied to clipboard",
      });
    }
  };

  // Handle view on Reddit
  const handleViewOnReddit = () => {
    const redditUrl = `https://reddit.com${thread.permalink}`;
    window.open(redditUrl, "_blank", "noopener,noreferrer");
  };

  // Function to get intent badge variant
  const getIntentVariant = (intentType: string | undefined) => {
    switch (intentType) {
      case "QUESTION":
        return "default";
      case "COMPARISON":
        return "secondary";
      case "REVIEW":
        return "outline";
      case "RECOMMENDATION":
        return "destructive";
      case "DISCOVERY":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-tight">
            {thread.title}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {thread.author}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              r/{thread.subreddit}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(thread.createdAt)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          <div className="bg-muted/30 p-3 rounded-lg flex flex-col items-center">
            <ArrowUpFromLine className="h-5 w-5 mb-1 text-muted-foreground" />
            <span className="text-lg font-semibold">{thread.upvotes}</span>
            <span className="text-xs text-muted-foreground">Upvotes</span>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg flex flex-col items-center">
            <MessageSquare className="h-5 w-5 mb-1 text-muted-foreground" />
            <span className="text-lg font-semibold">{thread.commentCount}</span>
            <span className="text-xs text-muted-foreground">Comments</span>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg flex flex-col items-center">
            <BarChart3 className="h-5 w-5 mb-1 text-muted-foreground" />
            <span className="text-lg font-semibold">{thread.score}</span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
        </div>

        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">
              <MessageSquare className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <Lightbulb className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="comment">
              <CheckCircle className="h-4 w-4 mr-2" />
              Comment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="mt-4 whitespace-pre-wrap bg-muted/30 p-4 rounded-md text-sm">
              {thread.body}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  Intent Analysis
                </h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  {thread.intentType ? (
                    <div className="space-y-2">
                      <Badge variant={getIntentVariant(thread.intentType)}>
                        {thread.intentType}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {thread.intentType === "QUESTION"
                          ? "User is asking a specific question that indicates purchase intent."
                          : thread.intentType === "COMPARISON"
                          ? "User is comparing different products or services."
                          : thread.intentType === "REVIEW"
                          ? "User is seeking reviews or opinions about a product."
                          : thread.intentType === "RECOMMENDATION"
                          ? "User is explicitly asking for product recommendations."
                          : "User is researching or discovering new products."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No intent detected</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1.5">
                  <Search className="h-4 w-4" />
                  SERP Analysis
                </h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  {thread.hasSerp ? (
                    <div className="space-y-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {thread.serpRank
                          ? `Ranked #${thread.serpRank}`
                          : "Position unknown"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {thread.serpRank && thread.serpRank <= 5
                          ? "This thread appears in top Google search results, indicating high visibility potential."
                          : thread.serpRank && thread.serpRank <= 10
                          ? "This thread appears on the first page of Google search results."
                          : "This thread appears in Google search results."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This thread does not currently appear in Google search results.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  Matched Keywords
                </h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  {thread.matchedKeywords && thread.matchedKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {thread.matchedKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No keywords matched from affiliate programs.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Opportunity Score
                </h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Score</span>
                      <span
                        className={`text-sm font-semibold ${
                          thread.score >= 80
                            ? "text-green-500"
                            : thread.score >= 60
                            ? "text-amber-500"
                            : "text-red-500"
                        }`}
                      >
                        {thread.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-primary/20 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${thread.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {thread.score >= 80
                        ? "Excellent opportunity for affiliate marketing."
                        : thread.score >= 60
                        ? "Good opportunity with moderate potential."
                        : "Limited opportunity with low conversion potential."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comment" className="space-y-4">
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Generate Affiliate Comment</h4>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateComment}
                  disabled={isGeneratingComment}
                >
                  {isGeneratingComment ? "Generating..." : "Generate Comment"}
                </Button>
              </div>

              {generatedComment ? (
                <div className="space-y-3">
                  <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {generatedComment}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyComment}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 p-4 rounded-md text-sm text-muted-foreground text-center">
                  {isGeneratingComment ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                      <p>Generating affiliate comment...</p>
                    </div>
                  ) : (
                    "Click 'Generate Comment' to create an affiliate marketing comment for this thread."
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handleViewOnReddit}
            className="flex items-center gap-2 sm:flex-1"
          >
            <Link2 className="h-4 w-4" />
            View on Reddit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}