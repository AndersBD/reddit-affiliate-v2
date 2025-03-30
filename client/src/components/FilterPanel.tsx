import React from "react";
import { Search, Filter, SlidersHorizontal, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThreadFilterOptions } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface FilterPanelProps {
  filters: ThreadFilterOptions;
  onFilterChange: (filters: Partial<ThreadFilterOptions>) => void;
}

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  // Intent type options
  const intentTypes = [
    { value: "QUESTION", label: "Question" },
    { value: "COMPARISON", label: "Comparison" },
    { value: "REVIEW", label: "Review" },
    { value: "RECOMMENDATION", label: "Recommendation" },
    { value: "DISCOVERY", label: "Discovery" }
  ];

  // SERP rank options
  const serpRanks = [
    { value: "Top 3", label: "Top 3" },
    { value: "Top 10", label: "Top 10" },
    { value: "Top 20", label: "Top 20" },
    { value: "Any", label: "Any Ranked" },
    { value: "None", label: "Not Ranked" }
  ];

  // Subreddit options (example - these would come from API)
  const subreddits = [
    { value: "contentcreation", label: "Content Creation" },
    { value: "SEO", label: "SEO" },
    { value: "blogging", label: "Blogging" },
    { value: "juststart", label: "Just Start" },
    { value: "Entrepreneur", label: "Entrepreneur" },
    { value: "Marketing", label: "Marketing" }
  ];

  // Affiliate program options (example - these would come from API)
  const affiliatePrograms = [
    { value: "Jasper AI", label: "Jasper AI" },
    { value: "Copy.ai", label: "Copy.ai" },
    { value: "WriteSonic", label: "WriteSonic" },
    { value: "Frase.io", label: "Frase.io" },
    { value: "Ahrefs", label: "Ahrefs" },
    { value: "SEMrush", label: "SEMrush" }
  ];

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    onFilterChange({ search });
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    onFilterChange({
      subreddit: undefined,
      intentType: undefined,
      serpRank: undefined,
      affiliateProgram: undefined,
      search: undefined,
      sortBy: undefined,
      sortDirection: undefined,
      offset: 0
    });
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            className="pl-10 w-full"
            value={filters.search || ""}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={filters.subreddit} 
            onValueChange={(value) => onFilterChange({ subreddit: value })}
          >
            <SelectTrigger className="w-[150px]">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Subreddit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {subreddits.map((subreddit) => (
                  <SelectItem key={subreddit.value} value={subreddit.value}>
                    {subreddit.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.intentType} 
            onValueChange={(value) => onFilterChange({ intentType: value })}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Intent Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {intentTypes.map((intent) => (
                  <SelectItem key={intent.value} value={intent.value}>
                    {intent.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">More Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">SERP Ranking</h4>
                  <Select 
                    value={filters.serpRank} 
                    onValueChange={(value) => onFilterChange({ serpRank: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Ranking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {serpRanks.map((rank) => (
                          <SelectItem key={rank.value} value={rank.value}>
                            {rank.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Affiliate Program</h4>
                  <Select 
                    value={filters.affiliateProgram} 
                    onValueChange={(value) => onFilterChange({ affiliateProgram: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {affiliatePrograms.map((program) => (
                          <SelectItem key={program.value} value={program.value}>
                            {program.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Sort By</h4>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => onFilterChange({ 
                      sortBy: value,
                      sortDirection: value ? (filters.sortDirection || "desc") : undefined 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Default Sorting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="score">Score</SelectItem>
                        <SelectItem value="upvotes">Upvotes</SelectItem>
                        <SelectItem value="commentCount">Comment Count</SelectItem>
                        <SelectItem value="createdAt">Date Posted</SelectItem>
                        <SelectItem value="serpRank">SERP Ranking</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                {filters.sortBy && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Sort Direction</h4>
                    <Select 
                      value={filters.sortDirection || "desc"} 
                      onValueChange={(value) => onFilterChange({ 
                        sortDirection: value as "asc" | "desc"
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Filter tags */}
      {(filters.subreddit || filters.intentType || filters.serpRank || filters.affiliateProgram || filters.search) && (
        <div className="flex flex-wrap gap-2">
          {filters.subreddit && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              Subreddit: {filters.subreddit}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1" 
                onClick={() => onFilterChange({ subreddit: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.intentType && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              Intent: {filters.intentType}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1" 
                onClick={() => onFilterChange({ intentType: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.serpRank && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              SERP: {filters.serpRank}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1" 
                onClick={() => onFilterChange({ serpRank: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.affiliateProgram && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              Program: {filters.affiliateProgram}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1" 
                onClick={() => onFilterChange({ affiliateProgram: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.search && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              Search: {filters.search}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1" 
                onClick={() => onFilterChange({ search: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}