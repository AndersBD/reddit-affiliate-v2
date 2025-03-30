import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  // Filter state
  const [subreddit, setSubreddit] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("score");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(50);
  const [minComments, setMinComments] = useState<number>(10);
  const [includeNSFW, setIncludeNSFW] = useState<boolean>(false);
  const [keywordFilter, setKeywordFilter] = useState<string>("");
  
  // Fetch subreddit categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['/api/subreddit-categories'],
  });

  // Apply filters
  const applyFilters = () => {
    const filters = {
      subreddit,
      sortBy,
      timeRange,
      minScore,
      minComments,
      includeNSFW,
      keywordFilter
    };
    
    onFilterChange(filters);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSubreddit("");
    setSortBy("score");
    setTimeRange("all");
    setMinScore(50);
    setMinComments(10);
    setIncludeNSFW(false);
    setKeywordFilter("");
    
    onFilterChange({});
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Subreddit Selection */}
        <div className="space-y-2">
          <Label htmlFor="subreddit">Subreddit</Label>
          <Select value={subreddit} onValueChange={setSubreddit}>
            <SelectTrigger id="subreddit">
              <SelectValue placeholder="All Subreddits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subreddits</SelectItem>
              
              {categories && Object.entries(categories).map(([category, subreddits]) => (
                <SelectItem key={category} value={category} disabled>
                  {category.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="comments">Comment Count</SelectItem>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="opportunity">Opportunity Score</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range */}
        <div className="space-y-2">
          <Label htmlFor="timeRange">Time Range</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Past 24 Hours</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced-filters">
          <AccordionTrigger className="text-sm font-medium">
            Advanced Filters
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Min Score Slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="minScore">Minimum Score</Label>
                  <span className="text-xs text-muted-foreground">{minScore}</span>
                </div>
                <Slider
                  id="minScore"
                  min={0}
                  max={1000}
                  step={10}
                  value={[minScore]}
                  onValueChange={(values) => setMinScore(values[0])}
                />
              </div>

              {/* Min Comments Slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="minComments">Minimum Comments</Label>
                  <span className="text-xs text-muted-foreground">{minComments}</span>
                </div>
                <Slider
                  id="minComments"
                  min={0}
                  max={500}
                  step={5}
                  value={[minComments]}
                  onValueChange={(values) => setMinComments(values[0])}
                />
              </div>

              {/* Keyword Filter */}
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword Filter</Label>
                <Input
                  id="keyword"
                  placeholder="Filter by keywords (comma separated)"
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                />
              </div>

              {/* Include NSFW Toggle */}
              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="nsfwToggle"
                  checked={includeNSFW}
                  onCheckedChange={(checked) => setIncludeNSFW(!!checked)}
                />
                <Label htmlFor="nsfwToggle" className="text-sm font-normal cursor-pointer">
                  Include NSFW content
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex items-center justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
        <Button onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}