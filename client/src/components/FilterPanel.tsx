import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ThreadFilterOptions } from "@/lib/types";
import { INTENT_TYPES, SERP_RANKS } from "@/lib/constants";

interface FilterPanelProps {
  filters: ThreadFilterOptions;
  onFilterChange: (filters: Partial<ThreadFilterOptions>) => void;
}

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [subreddit, setSubreddit] = useState<string>("all-subreddits");
  const [intentType, setIntentType] = useState<string>("all-intents");
  const [serpRank, setSerpRank] = useState<string>("any-rank");
  const [affiliateProgram, setAffiliateProgram] = useState<string>("all-programs");

  // Fetch the list of subreddits (fetched from threads as unique values)
  const { data: threadsData } = useQuery({ queryKey: ['/api/threads'] });
  
  // Fetch the list of affiliate programs
  const { data: programsData } = useQuery({ queryKey: ['/api/affiliate-programs'] });

  // Extract unique subreddits from threads
  const subreddits = threadsData?.threads 
    ? [...new Set(threadsData.threads.map((thread: any) => thread.subreddit))]
    : [];

  // Update local state when filters prop changes
  useEffect(() => {
    setSubreddit(filters.subreddit || "all-subreddits");
    setIntentType(filters.intentType || "all-intents");
    setSerpRank(filters.serpRank || "any-rank");
    setAffiliateProgram(filters.affiliateProgram || "all-programs");
  }, [filters]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onFilterChange({
      subreddit: subreddit === "all-subreddits" ? undefined : subreddit || undefined,
      intentType: intentType === "all-intents" ? undefined : intentType || undefined,
      serpRank: serpRank === "any-rank" ? undefined : serpRank || undefined,
      affiliateProgram: affiliateProgram === "all-programs" ? undefined : affiliateProgram || undefined
    });
  };

  // Handle reset
  const handleReset = () => {
    setSubreddit("all-subreddits");
    setIntentType("all-intents");
    setSerpRank("any-rank");
    setAffiliateProgram("all-programs");
    
    onFilterChange({
      subreddit: undefined,
      intentType: undefined,
      serpRank: undefined,
      affiliateProgram: undefined
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div>
              <Label htmlFor="subreddit-filter" className="mb-1">Subreddit</Label>
              <Select 
                value={subreddit} 
                onValueChange={setSubreddit}
              >
                <SelectTrigger id="subreddit-filter" className="w-full">
                  <SelectValue placeholder="All Subreddits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-subreddits">All Subreddits</SelectItem>
                  {subreddits.map((sub: string) => (
                    <SelectItem key={sub} value={sub}>
                      r/{sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="intent-filter" className="mb-1">Intent</Label>
              <Select 
                value={intentType} 
                onValueChange={setIntentType}
              >
                <SelectTrigger id="intent-filter" className="w-full">
                  <SelectValue placeholder="All Intents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-intents">All Intents</SelectItem>
                  {INTENT_TYPES.map(intent => (
                    <SelectItem key={intent} value={intent}>
                      {intent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="serp-filter" className="mb-1">SERP Rank</Label>
              <Select 
                value={serpRank} 
                onValueChange={setSerpRank}
              >
                <SelectTrigger id="serp-filter" className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any-rank">Any</SelectItem>
                  {SERP_RANKS.map(rank => (
                    <SelectItem key={rank} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="affiliate-filter" className="mb-1">Affiliate Program</Label>
            <Select 
              value={affiliateProgram} 
              onValueChange={setAffiliateProgram}
            >
              <SelectTrigger id="affiliate-filter" className="w-full">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-programs">All Programs</SelectItem>
                {programsData?.map((program: any) => (
                  <SelectItem key={program.id} value={program.name}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
          >
            Reset Filters
          </Button>
          <Button 
            type="submit" 
            className="ml-3"
          >
            Apply Filters
          </Button>
        </div>
      </form>
    </div>
  );
}
