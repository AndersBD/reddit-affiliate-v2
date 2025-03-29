import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterPanel from "@/components/FilterPanel";
import OpportunityList from "@/components/OpportunityList";
import ThreadPreviewModal from "@/components/ThreadPreviewModal";
import { RedditThread, ThreadFilterOptions } from "@/lib/types";

export default function Dashboard() {
  const [selectedThread, setSelectedThread] = useState<RedditThread | null>(null);
  const [filters, setFilters] = useState<ThreadFilterOptions>({
    limit: 10,
    offset: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.subreddit) params.append("subreddit", filters.subreddit);
    if (filters.intentType) params.append("intentType", filters.intentType);
    if (filters.serpRank) params.append("serpRank", filters.serpRank);
    if (filters.affiliateProgram) params.append("affiliateProgram", filters.affiliateProgram);
    if (filters.search) params.append("search", filters.search);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDirection) params.append("sortDirection", filters.sortDirection);
    
    return params.toString();
  };

  // Fetch threads
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/threads?${buildQueryString()}`],
  });

  // Handle opening the thread preview modal
  const handleThreadClick = (thread: RedditThread) => {
    setSelectedThread(thread);
    setIsModalOpen(true);
  };

  // Handle closing the thread preview modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ThreadFilterOptions>) => {
    setFilters({
      ...filters,
      ...newFilters,
      // Reset pagination when filters change
      offset: 0
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * (filters.limit || 10);
    setFilters({
      ...filters,
      offset: newOffset
    });
  };

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-semibold text-neutral-900">Affiliate Opportunities</h1>
            <div className="mt-3 md:mt-0">
              <div className="inline-flex rounded-md shadow-sm">
                <button 
                  type="button" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300"
                  onClick={() => handleFilterChange({ sortBy: undefined })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  All
                </button>
                <button 
                  type="button" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 border-t border-b border-neutral-300"
                  onClick={() => handleFilterChange({ sortBy: "score", sortDirection: "desc" })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Top Scoring
                </button>
                <button 
                  type="button" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300"
                  onClick={() => handleFilterChange({ serpRank: "Top 10" })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  Google Ranked
                </button>
              </div>
            </div>
          </div>
          
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          
          <OpportunityList 
            isLoading={isLoading}
            error={error}
            data={data}
            onThreadClick={handleThreadClick}
            onPageChange={handlePageChange}
            currentOffset={filters.offset || 0}
            pageSize={filters.limit || 10}
          />
        </div>
      </div>
      
      {selectedThread && (
        <ThreadPreviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          thread={selectedThread}
        />
      )}
    </main>
  );
}
