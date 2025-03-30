import "../index.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Reddit Affiliate Opportunity Engine",
  description: "Discover high-potential affiliate marketing opportunities on Reddit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}