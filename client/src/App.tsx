import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import CrawlerTest from "@/pages/CrawlerTest";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/crawler-test" component={CrawlerTest} />
      {/* Add more routes here */}
      <Route path="/subreddits" component={NotFound} />
      <Route path="/keywords" component={NotFound} />
      <Route path="/opportunities" component={NotFound} />
      <Route path="/content" component={NotFound} />
      <Route path="/schedule" component={NotFound} />
      <Route path="/analytics" component={NotFound} />
      <Route path="/settings" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
