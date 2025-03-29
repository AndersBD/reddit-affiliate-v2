import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AffiliateProgram, CommentTemplate, RedditThread } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ThreadPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: RedditThread;
}

export default function ThreadPreviewModal({ isOpen, onClose, thread }: ThreadPreviewModalProps) {
  const { toast } = useToast();
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [generatedComment, setGeneratedComment] = useState<string>("");

  // Fetch affiliate programs
  const { data: programs, isLoading: isLoadingPrograms } = useQuery<AffiliateProgram[]>({
    queryKey: ['/api/affiliate-programs'],
    enabled: isOpen,
  });

  // Fetch comment templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery<CommentTemplate[]>({
    queryKey: ['/api/comment-templates'],
    enabled: isOpen,
  });

  // Reset state when modal opens with a new thread
  useEffect(() => {
    if (isOpen) {
      setSelectedProgramId("");
      setSelectedTemplateId("");
      setGeneratedComment("");
    }
  }, [isOpen, thread.id]);

  // Generate comment mutation
  const generateCommentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/generate-comment", {
        threadId: thread.id,
        affiliateProgramId: parseInt(selectedProgramId),
        templateId: parseInt(selectedTemplateId)
      });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      setGeneratedComment(data.comment);
    },
    onError: (error) => {
      toast({
        title: "Error generating comment",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleGenerateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId || !selectedTemplateId) {
      toast({
        title: "Missing selection",
        description: "Please select both an affiliate program and a comment template.",
        variant: "destructive",
      });
      return;
    }

    generateCommentMutation.mutate();
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedComment);
    toast({
      title: "Copied to clipboard",
      description: "The generated comment has been copied to your clipboard.",
    });
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get detected affiliate products from thread
  const getDetectedProducts = () => {
    if (!programs) return [];
    
    return programs.filter(program => 
      thread.matchedKeywords.some(keyword => 
        program.keywords.includes(keyword)
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle id="thread-preview-title" className="text-lg">
            {thread.title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
              r/
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-500">
                r/{thread.subreddit} · {formatDate(thread.createdAt)} · {thread.upvotes} upvotes
                {thread.hasSerp && thread.serpRank && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    SERP #{thread.serpRank}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-md whitespace-pre-line">
            {thread.body}
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium text-neutral-900 mb-2">Affiliate Opportunities</h4>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Detected Affiliate Products:</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                  {thread.affiliateMatch}% Match
                </span>
              </div>
              <ul className="space-y-2">
                {getDetectedProducts().map((program) => (
                  <li key={program.id} className="flex items-center">
                    <span className="flex-shrink-0 h-5 w-5 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="ml-2 text-sm text-neutral-700">{program.name}</span>
                  </li>
                ))}
                {getDetectedProducts().length === 0 && (
                  <li className="text-sm text-neutral-500">No affiliate products detected</li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium text-neutral-900 mb-2">Generate Affiliate Comment</h4>
            <div className="bg-white border border-neutral-300 rounded-md p-4">
              <form onSubmit={handleGenerateComment}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="affiliate-program">Affiliate Program</Label>
                    <Select 
                      value={selectedProgramId} 
                      onValueChange={setSelectedProgramId}
                      disabled={isLoadingPrograms || generateCommentMutation.isPending}
                    >
                      <SelectTrigger id="affiliate-program">
                        <SelectValue placeholder="Select an affiliate program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs?.map((program) => (
                          <SelectItem key={program.id} value={program.id.toString()}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="comment-template">Comment Template</Label>
                    <Select 
                      value={selectedTemplateId} 
                      onValueChange={setSelectedTemplateId}
                      disabled={isLoadingTemplates || generateCommentMutation.isPending}
                    >
                      <SelectTrigger id="comment-template">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates?.map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Textarea
                      rows={6}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                      placeholder="Generated comment will appear here..."
                      value={generatedComment}
                      readOnly
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="submit" 
                      variant="outline"
                      disabled={!selectedProgramId || !selectedTemplateId || generateCommentMutation.isPending}
                    >
                      {generateCommentMutation.isPending ? "Generating..." : (generatedComment ? "Regenerate" : "Generate")}
                    </Button>
                    {generatedComment && (
                      <Button 
                        type="button" 
                        onClick={handleCopyToClipboard}
                      >
                        Copy to Clipboard
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
