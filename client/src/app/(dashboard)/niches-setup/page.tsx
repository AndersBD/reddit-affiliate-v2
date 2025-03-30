"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { NicheSelector } from "@/components/niches-setup/NicheSelector";
import { AffiliateProgramForm } from "@/components/niches-setup/AffiliateProgramForm";
import { SubredditPicker } from "@/components/niches-setup/SubredditPicker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function NicheSetupPage() {
  const [activeTab, setActiveTab] = useState("niches");
  
  // Fetch all categories to display in the UI
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/subreddit-categories'],
  });
  
  // Fetch affiliate programs to display in the UI
  const { data: affiliatePrograms, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['/api/affiliate-programs'],
  });
  
  // Animation variants for tab content
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Niche & Subreddit Setup</h1>
        <p className="text-muted-foreground mt-2">
          Configure your target niches, affiliate programs, and subreddits to monitor.
        </p>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Setup Wizard</CardTitle>
            <CardDescription>
              Complete these steps to set up your affiliate marketing strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="niches">1. Select Niches</TabsTrigger>
                <TabsTrigger value="programs">2. Add Affiliate Programs</TabsTrigger>
                <TabsTrigger value="subreddits">3. Choose Subreddits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="niches">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={tabContentVariants}
                >
                  <NicheSelector 
                    onComplete={() => setActiveTab("programs")}
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="programs">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={tabContentVariants}
                >
                  <AffiliateProgramForm 
                    existingPrograms={affiliatePrograms || []}
                    isLoading={isLoadingPrograms}
                    onComplete={() => setActiveTab("subreddits")}
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="subreddits">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={tabContentVariants}
                >
                  <SubredditPicker 
                    categories={categories || {}}
                    isLoading={isLoadingCategories}
                    onComplete={() => console.log("Setup complete")}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}