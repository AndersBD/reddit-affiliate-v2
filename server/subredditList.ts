// Standard subreddit list for crawler
export interface SubredditCategory {
  category: string;
  subreddits: string[];
}

export const standardSubreddits: SubredditCategory[] = [
  {
    "category": "AI & Machine Learning",
    "subreddits": [
      "r/artificial",
      "r/MachineLearning",
      "r/ChatGPT",
      "r/deeplearning",
      "r/AI_Agents",
      "r/StableDiffusion",
      "r/learnmachinelearning",
      "r/MLQuestions",
      "r/computervision",
      "r/NaturalLanguageProcessing",
      "r/OpenAI",
      "r/LocalLLaMA",
      "r/LanguageTechnology",
      "r/gpt3",
      "r/LLM",
      "r/PromptEngineering",
      "r/GenerativeAI"
    ]
  },
  {
    "category": "SaaS & Startup",
    "subreddits": [
      "r/SaaS",
      "r/microsaas",
      "r/NoCodeSaaS",
      "r/Startups",
      "r/SaaSFounders",
      "r/Entrepreneur",
      "r/EntrepreneurRideAlong",
      "r/SideProject",
      "r/SideProjects",
      "r/SaaSnews",
      "r/SaaSstartups",
      "r/GrowthHacking",
      "r/growmybusiness",
      "r/OnlineBusiness",
      "r/TechStartups",
      "r/IndieStartups",
      "r/SaaS_marketing",
      "r/SaaS_deals",
      "r/SaaSjobs",
      "r/SaaSgrowth"
    ]
  },
  {
    "category": "Software Development & Engineering",
    "subreddits": [
      "r/programming",
      "r/software",
      "r/webdev",
      "r/Frontend",
      "r/FullStack",
      "r/devops",
      "r/aws",
      "r/Azure",
      "r/gcloud",
      "r/coding",
      "r/learnprogramming",
      "r/SoftwareEngineering",
      "r/java",
      "r/python",
      "r/javascript",
      "r/reactjs",
      "r/node",
      "r/django",
      "r/flask",
      "r/Vue",
      "r/angular",
      "r/laravel",
      "r/rust",
      "r/golang",
      "r/ruby",
      "r/rubyOnRails"
    ]
  },
  {
    "category": "No-Code / Automation",
    "subreddits": [
      "r/NoCode",
      "r/NoCodeDevelopment",
      "r/NoCodeFounders",
      "r/bubble",
      "r/Webflow",
      "r/automation",
      "r/automate",
      "r/lowcode"
    ]
  },
  {
    "category": "Marketing, SEO & Content Strategy",
    "subreddits": [
      "r/marketing",
      "r/digital_marketing",
      "r/GrowthHack",
      "r/SEO",
      "r/TechSEO",
      "r/content_marketing",
      "r/copywriting",
      "r/CopywritingFeedback",
      "r/ContentCreators",
      "r/emailmarketing",
      "r/SocialMediaMarketing"
    ]
  },
  {
    "category": "Productivity & Knowledge Tools",
    "subreddits": [
      "r/productivity",
      "r/Notion",
      "r/ObsidianMD",
      "r/Trello",
      "r/Airtable",
      "r/ClickUp",
      "r/asana"
    ]
  }
];

// Helper function to get all subreddits as a flat array
export function getAllSubreddits(): string[] {
  return standardSubreddits.flatMap(category => category.subreddits);
}

// Helper function to get subreddits by category
export function getSubredditsByCategory(category: string): string[] {
  const categoryData = standardSubreddits.find(c => c.category === category);
  return categoryData ? categoryData.subreddits : [];
}

// Get a list of all categories
export function getAllCategories(): string[] {
  return standardSubreddits.map(category => category.category);
}