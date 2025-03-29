import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CrawlerTest = () => {
  const [subreddits, setSubreddits] = useState<string>('programming,javascript');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const subredditArray = subreddits.split(',').map(s => s.trim());
      
      const response = await fetch('/api/test-dotnet-crawler', {
        method: 'POST',
        body: JSON.stringify({ subreddits: subredditArray }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Crawler Test Started",
        description: `Testing crawler on subreddits: ${subredditArray.join(', ')}`,
      });
    } catch (error) {
      console.error('Error testing crawler:', error);
      toast({
        title: "Error",
        description: "Failed to test the crawler. Please check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runScheduledJob = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/scheduler/run-now', {
        method: 'POST'
      });
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Scheduled Crawler Job",
        description: "The crawler job has been triggered on all standard subreddits",
      });
    } catch (error) {
      console.error('Error running scheduled job:', error);
      toast({
        title: "Error",
        description: "Failed to run the scheduled crawler job. Please check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Reddit Crawler Test Interface</h1>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Crawler on Specific Subreddits</CardTitle>
            <CardDescription>
              Enter a comma-separated list of subreddits to crawl
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subreddits">Subreddits</Label>
                <Input
                  id="subreddits"
                  placeholder="programming,javascript,webdev"
                  value={subreddits}
                  onChange={(e) => setSubreddits(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Crawler"
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Run Scheduled Crawler Job</CardTitle>
            <CardDescription>
              Run the crawler job on all standard subreddits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              This will start a crawler job on all standard subreddits configured in the system.
              The job runs in the background and results will be saved to the database.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={runScheduledJob} 
              disabled={isLoading}
              className="w-full"
              variant="secondary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Run Scheduled Job"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              Response from the crawler service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      <Separator className="my-8" />
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Crawler Status</h2>
        <p className="text-gray-600">
          The crawler is configured to run every 12 hours automatically.
          You can manually trigger a run using the buttons above.
        </p>
      </div>
    </div>
  );
};

export default CrawlerTest;