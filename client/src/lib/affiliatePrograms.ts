import { AffiliateProgram } from "./types";

// Sample affiliate programs
export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  { 
    id: 1,
    name: "Jasper AI", 
    description: "AI writing assistant for creating content", 
    link: "https://jasper.ai/?aff=123", 
    promoCode: "REDDIT20", 
    keywords: ["AI writer", "content creation", "blog writing", "Jasper", "AI writing"], 
    commissionRate: "30%",
    active: true
  },
  { 
    id: 2,
    name: "Copy.ai", 
    description: "AI copywriting tool for marketers", 
    link: "https://copy.ai/?via=123", 
    promoCode: "REDDIT15", 
    keywords: ["copywriting", "marketing copy", "AI copywriter", "Copy.ai"], 
    commissionRate: "25%",
    active: true
  },
  { 
    id: 3,
    name: "WriteSonic", 
    description: "AI content writing tool for blogs and articles", 
    link: "https://writesonic.com/?ref=123", 
    promoCode: "REDDIT10", 
    keywords: ["WriteSonic", "blog writing", "article writing", "AI content"], 
    commissionRate: "20%",
    active: true
  },
  { 
    id: 4,
    name: "Frase.io", 
    description: "SEO content optimization tool", 
    link: "https://frase.io/?ref=123", 
    promoCode: "REDDIT25", 
    keywords: ["SEO", "content optimization", "Frase.io", "SEO writing"], 
    commissionRate: "35%",
    active: true
  },
  { 
    id: 5,
    name: "Ahrefs", 
    description: "SEO toolset for backlinks and keyword research", 
    link: "https://ahrefs.com/affiliate/123", 
    promoCode: "REDDIT10", 
    keywords: ["SEO", "backlinks", "keyword research", "Ahrefs"], 
    commissionRate: "15%",
    active: true
  },
  { 
    id: 6,
    name: "SEMrush", 
    description: "All-in-one marketing toolkit for SEO", 
    link: "https://semrush.com/refer/123", 
    promoCode: "REDDIT30", 
    keywords: ["SEO", "marketing toolkit", "SEMrush", "keyword research"], 
    commissionRate: "40%",
    active: true
  }
];
