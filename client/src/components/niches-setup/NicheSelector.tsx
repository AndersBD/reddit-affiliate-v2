import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NicheSelectorProps {
  onComplete: () => void;
}

// Pre-defined niche categories
const nicheCategories = [
  {
    id: "content-creation",
    name: "Content Creation",
    description: "Tools and services for bloggers, YouTubers, and content creators",
    icon: "📝",
    keywords: ["blogging", "YouTube", "podcast", "content marketing"]
  },
  {
    id: "seo",
    name: "SEO",
    description: "Search engine optimization tools and services",
    icon: "🔍",
    keywords: ["SEO", "backlinks", "keyword research", "traffic"]
  },
  {
    id: "web-dev",
    name: "Web Development",
    description: "Web hosting, themes, plugins, and development tools",
    icon: "💻",
    keywords: ["WordPress", "hosting", "website", "development"]
  },
  {
    id: "ai-tools",
    name: "AI Tools",
    description: "AI writing assistants, image generators, and productivity tools",
    icon: "🤖",
    keywords: ["AI", "writing", "automation", "GPT"]
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online store platforms, dropshipping, and e-commerce tools",
    icon: "🛒",
    keywords: ["Shopify", "dropshipping", "online store", "e-commerce"]
  },
  {
    id: "finance",
    name: "Personal Finance",
    description: "Investing, cryptocurrency, and financial planning tools",
    icon: "💰",
    keywords: ["investing", "crypto", "finance", "budgeting"]
  },
  {
    id: "education",
    name: "Online Education",
    description: "Online courses, educational platforms, and learning resources",
    icon: "🎓",
    keywords: ["courses", "learning", "education", "skills"]
  },
  {
    id: "marketing",
    name: "Digital Marketing",
    description: "Email marketing, social media, and advertising tools",
    icon: "📈",
    keywords: ["marketing", "ads", "email", "social media"]
  }
];

export function NicheSelector({ onComplete }: NicheSelectorProps) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [customNiche, setCustomNiche] = useState("");
  const [customKeywords, setCustomKeywords] = useState("");
  
  const toggleNiche = (nicheId: string) => {
    if (selectedNiches.includes(nicheId)) {
      setSelectedNiches(selectedNiches.filter(id => id !== nicheId));
    } else {
      setSelectedNiches([...selectedNiches, nicheId]);
    }
  };

  const addCustomNiche = () => {
    if (customNiche && customKeywords) {
      // In a real app, we would send this to the backend
      console.log("Custom niche added:", { 
        name: customNiche, 
        keywords: customKeywords.split(",").map(k => k.trim()) 
      });
      
      // Reset form
      setCustomNiche("");
      setCustomKeywords("");
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-medium">Select Your Niches</h3>
        <p className="text-sm text-muted-foreground">
          Choose the niches you want to target for affiliate marketing opportunities
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nicheCategories.map((niche) => (
          <Card 
            key={niche.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedNiches.includes(niche.id) && "border-primary"
            )}
            onClick={() => toggleNiche(niche.id)}
          >
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base mb-1 flex items-center">
                  <span className="mr-2">{niche.icon}</span> 
                  {niche.name}
                </CardTitle>
                <CardDescription className="text-xs">{niche.description}</CardDescription>
              </div>
              {selectedNiches.includes(niche.id) && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <CheckIcon className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex flex-wrap gap-1 mt-2">
                {niche.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add custom niche card */}
        <Card className="border-dashed">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base mb-1 flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" /> 
              Add Custom Niche
            </CardTitle>
            <CardDescription className="text-xs">
              Create a custom niche with your own keywords
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div>
              <label htmlFor="niche-name" className="text-xs font-medium">
                Niche Name
              </label>
              <input 
                id="niche-name"
                type="text"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
                className="w-full p-2 text-sm rounded-md border mt-1"
                placeholder="e.g., Fitness Equipment"
              />
            </div>
            <div>
              <label htmlFor="keywords" className="text-xs font-medium">
                Keywords (comma-separated)
              </label>
              <input 
                id="keywords"
                type="text"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                className="w-full p-2 text-sm rounded-md border mt-1"
                placeholder="e.g., fitness, workout, exercise"
              />
            </div>
            <Button 
              size="sm" 
              className="w-full mt-2"
              disabled={!customNiche || !customKeywords}
              onClick={addCustomNiche}
            >
              Add Niche
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center pt-4">
        <div>
          <p className="text-sm font-medium">
            {selectedNiches.length} niche{selectedNiches.length !== 1 ? 's' : ''} selected
          </p>
          {selectedNiches.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedNiches.map((nicheId) => {
                const niche = nicheCategories.find(n => n.id === nicheId);
                return niche ? (
                  <Badge key={nicheId} className="flex items-center gap-1 pr-1">
                    {niche.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNiche(nicheId);
                      }}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
        <Button
          onClick={onComplete}
          disabled={selectedNiches.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}