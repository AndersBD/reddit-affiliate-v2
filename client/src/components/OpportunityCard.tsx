import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RedditThread } from "@/lib/types";
import { getIntentColor } from "@/lib/utils";

interface OpportunityCardProps {
  thread: RedditThread;
  onClick: () => void;
}

export default function OpportunityCard({ thread, onClick }: OpportunityCardProps) {
  const {
    title,
    subreddit,
    upvotes,
    commentCount,
    intentType,
    serpRank,
    hasSerp,
    matchedKeywords,
    affiliateMatch,
    createdAt
  } = thread;

  // Format date for display (e.g., "2d ago")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks}w ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths}mo ago`;
    }
  };

  // Get color for intent type badge
  const intentColor = getIntentColor(intentType);
  
  // Truncate body for display (first 150 characters)
  const truncateBody = (text: string, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get sample of matched keywords (max 3)
  const keywordSample = matchedKeywords?.slice(0, 3) || [];

  return (
    <li className="opportunity-card cursor-pointer hover:bg-neutral-50" onClick={onClick}>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
              r/
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h4 className="text-sm font-medium text-neutral-900">{title}</h4>
                {intentType && (
                  <Badge 
                    variant="secondary" 
                    className={`ml-2 ${intentColor}`}
                  >
                    {intentType}
                  </Badge>
                )}
              </div>
              <div className="flex mt-1">
                <p className="text-sm text-neutral-500">
                  r/{subreddit} · {formatDate(createdAt)} · {upvotes} upvotes
                </p>
                {hasSerp && serpRank && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    SERP #{serpRank}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-sm font-medium text-neutral-900 mr-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                {affiliateMatch}% Match
              </span>
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Generate Comment
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-neutral-600 line-clamp-2">
            {truncateBody(thread.body)}
          </p>
        </div>
        <div className="mt-2">
          {keywordSample.map((keyword, index) => (
            <Badge key={index} variant="outline" className="mr-2 bg-blue-100 text-blue-800 border-blue-100">
              {keyword}
            </Badge>
          ))}
          {matchedKeywords?.length > 3 && (
            <Badge variant="outline" className="mr-2 bg-blue-100 text-blue-800 border-blue-100">
              +{matchedKeywords.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </li>
  );
}
