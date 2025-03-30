"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GiftIcon,
  BarChart3Icon,
  SearchIcon,
  MessageSquarePlusIcon,
  GlobeIcon,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  
  // Auto-redirect to dashboard page (this is just a landing page)
  useEffect(() => {
    // Using a small timeout allows the page to render briefly before redirecting
    const timer = setTimeout(() => {
      router.push("/niches-setup");
    }, 500);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex items-center mb-4">
          <GiftIcon className="h-10 w-10 text-primary mr-2" />
          <h1 className="text-4xl font-bold">Reddit Affiliate Engine</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Discover high-potential Reddit threads for affiliate marketing opportunities
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <SearchIcon className="h-6 w-6 text-primary mb-2" />
            <CardTitle>Intelligent Thread Discovery</CardTitle>
            <CardDescription>
              Automatically crawl subreddits to find threads with high engagement and affiliate potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our advanced crawler finds threads across your selected subreddits and analyzes them for buying intent 
              and keyword relevance to identify prime affiliate marketing opportunities.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => router.push("/discovery")}>
              Discover Threads →
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <BarChart3Icon className="h-6 w-6 text-primary mb-2" />
            <CardTitle>Opportunity Scoring</CardTitle>
            <CardDescription>
              Automatically analyze and score threads based on buying intent and keyword relevance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our scoring algorithm evaluates threads for purchase intent, relevance to your affiliate programs, 
              engagement metrics, and SERP visibility to ensure you focus on the highest-potential opportunities.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => router.push("/discovery")}>
              View Opportunities →
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <MessageSquarePlusIcon className="h-6 w-6 text-primary mb-2" />
            <CardTitle>AI Comment Generator</CardTitle>
            <CardDescription>
              Generate personalized, high-converting affiliate comments with our AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create natural, helpful responses that seamlessly incorporate your affiliate links. Our AI ensures 
              comments are valuable to users while optimizing for conversions and Reddit guidelines compliance.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => router.push("/content-generator")}>
              Generate Content →
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <div className="flex flex-col md:flex-row gap-6 max-w-4xl">
          <div className="flex-1 flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground">
            <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
              <span className="text-primary font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Set Up Your Niches</h3>
            <p className="text-sm text-muted-foreground">
              Configure your target niches and add affiliate programs you want to promote
            </p>
            <Button 
              variant="link" 
              className="mt-4"
              onClick={() => router.push("/niches-setup")}
            >
              Configure Niches →
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground">
            <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
              <span className="text-primary font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Discover Opportunities</h3>
            <p className="text-sm text-muted-foreground">
              Run the crawler to find and analyze Reddit threads for affiliate opportunities
            </p>
            <Button 
              variant="link" 
              className="mt-4"
              onClick={() => router.push("/discovery")}
            >
              Start Discovery →
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground">
            <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
              <span className="text-primary font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Create Affiliate Content</h3>
            <p className="text-sm text-muted-foreground">
              Generate effective, natural-sounding affiliate comments to post on Reddit
            </p>
            <Button 
              variant="link" 
              className="mt-4"
              onClick={() => router.push("/content-generator")}
            >
              Create Content →
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-1 mb-2">
          <GlobeIcon className="h-4 w-4" />
          <span>Reddit Affiliate Opportunity Engine</span>
        </div>
        <p>© 2025 All Rights Reserved</p>
      </footer>
    </div>
  );
}