import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, SearchIcon, CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubredditPicker {
  categories: Record<string, string[]>;
  isLoading: boolean;
  onComplete: () => void;
}

interface Subreddit {
  name: string;
  category: string;
  subscribers?: number;
  description?: string;
}

export function SubredditPicker({ categories, isLoading, onComplete }: SubredditPicker) {
  const [selectedSubreddits, setSelectedSubreddits] = useState<Subreddit[]>([]);
  const [customSubreddit, setCustomSubreddit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all subreddits
  const { data: allSubreddits, isLoading: isLoadingSubreddits } = useQuery({
    queryKey: ['/api/subreddits'],
  });

  // Add custom subreddit mutation
  const addSubredditMutation = useMutation({
    mutationFn: (subreddit: { name: string }) => {
      return apiRequest("/api/subreddits", {
        method: "POST",
        body: JSON.stringify(subreddit),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subreddits'] });
      setCustomSubreddit("");
      toast({
        title: "Success",
        description: "Subreddit added successfully",
      });
    },
  });

  // Save selected subreddits mutation
  const saveSubredditsMutation = useMutation({
    mutationFn: (subreddits: Subreddit[]) => {
      return apiRequest("/api/user/subreddits", {
        method: "POST",
        body: JSON.stringify({ subreddits }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subreddits saved successfully",
      });
      onComplete();
    },
  });

  // Handle adding a custom subreddit
  const handleAddCustomSubreddit = () => {
    if (customSubreddit) {
      const formattedName = customSubreddit.startsWith('r/') 
        ? customSubreddit 
        : `r/${customSubreddit}`;
      
      addSubredditMutation.mutate({ name: formattedName });
    }
  };

  // Handle selecting a subreddit
  const toggleSubreddit = (subreddit: Subreddit) => {
    const isSelected = selectedSubreddits.some(s => s.name === subreddit.name);
    
    if (isSelected) {
      setSelectedSubreddits(selectedSubreddits.filter(s => s.name !== subreddit.name));
    } else {
      setSelectedSubreddits([...selectedSubreddits, subreddit]);
    }
  };

  // Handle saving selections
  const handleSaveSelections = () => {
    if (selectedSubreddits.length > 0) {
      saveSubredditsMutation.mutate(selectedSubreddits);
    }
  };

  // Filter subreddits based on search term
  const filteredSubreddits = !allSubreddits ? [] : allSubreddits.filter((subreddit: Subreddit) => 
    subreddit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subreddit.description && subreddit.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-medium">Choose Subreddits to Monitor</h3>
        <p className="text-sm text-muted-foreground">
          Select which subreddits to crawl for affiliate marketing opportunities
        </p>
      </div>

      {/* Categories Accordion */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <div className="pl-6 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {Object.entries(categories).map(([category, subreddits]) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger className="px-4">
                  <div className="flex items-center">
                    <span className="font-medium capitalize">{category}</span>
                    <Badge variant="outline" className="ml-2">
                      {subreddits.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {subreddits.map((subreddit) => {
                      const isSelected = selectedSubreddits.some(s => s.name === subreddit);
                      return (
                        <div 
                          key={subreddit} 
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={subreddit}
                            checked={isSelected}
                            onCheckedChange={() => toggleSubreddit({ 
                              name: subreddit, 
                              category: category
                            })}
                          />
                          <label
                            htmlFor={subreddit}
                            className="flex-1 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {subreddit}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Subreddit Search Box */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left font-normal"
            >
              <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <span>Search for subreddits...</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" side="bottom" className="w-[400px]">
            <Command>
              <CommandInput 
                placeholder="Search subreddits..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No subreddits found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {isLoadingSubreddits ? (
                      <div className="p-4 space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-5 w-full" />
                        ))}
                      </div>
                    ) : (
                      filteredSubreddits.map((subreddit: Subreddit) => {
                        const isSelected = selectedSubreddits.some(s => s.name === subreddit.name);
                        return (
                          <CommandItem
                            key={subreddit.name}
                            onSelect={() => {
                              toggleSubreddit(subreddit);
                              setOpen(false);
                            }}
                            className="flex items-center"
                          >
                            <div className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                              <CheckIcon className="h-3 w-3" />
                            </div>
                            <span>{subreddit.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {subreddit.subscribers && `${subreddit.subscribers.toLocaleString()} members`}
                            </span>
                          </CommandItem>
                        );
                      })
                    )}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Add Custom Subreddit */}
      <div className="flex gap-2">
        <Input
          value={customSubreddit}
          onChange={(e) => setCustomSubreddit(e.target.value)}
          placeholder="Add custom subreddit (e.g., 'r/blogging')"
        />
        <Button
          variant="outline"
          onClick={handleAddCustomSubreddit}
          disabled={!customSubreddit || addSubredditMutation.isPending}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Selected Subreddits */}
      <div>
        <h4 className="text-sm font-medium mb-2">Selected Subreddits ({selectedSubreddits.length})</h4>
        <div className="flex flex-wrap gap-2">
          {selectedSubreddits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subreddits selected</p>
          ) : (
            selectedSubreddits.map((subreddit) => (
              <Badge 
                key={subreddit.name} 
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {subreddit.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => toggleSubreddit(subreddit)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSaveSelections}
          disabled={selectedSubreddits.length === 0 || saveSubredditsMutation.isPending}
        >
          {saveSubredditsMutation.isPending ? "Saving..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
}