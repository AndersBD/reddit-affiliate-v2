import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import OpportunityCard from "./OpportunityCard";
import { RedditThread } from "@/lib/types";

interface OpportunityListProps {
  isLoading: boolean;
  error: Error | null;
  data: any;
  onThreadClick: (thread: RedditThread) => void;
  onPageChange: (page: number) => void;
  currentOffset: number;
  pageSize: number;
}

export default function OpportunityList({ 
  isLoading, 
  error, 
  data, 
  onThreadClick,
  onPageChange,
  currentOffset,
  pageSize
}: OpportunityListProps) {
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600">Error loading opportunities</h3>
          <p className="mt-1 text-sm text-neutral-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const currentPage = Math.floor(currentOffset / pageSize) + 1;
  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;
  
  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5; // Maximum number of page links to show
    
    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          onClick={() => onPageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <PaginationItem key={`page-${i}`}>
            <PaginationLink 
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            onClick={() => onPageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-neutral-200 px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-neutral-900">Latest Opportunities</h3>
          {!isLoading && data && (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {data.total} found
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-neutral-500">Threads discovered from your target subreddits.</p>
      </div>
      
      {isLoading ? (
        <div className="divide-y divide-neutral-200">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-neutral-200">
            {data?.threads?.length > 0 ? (
              data.threads.map((thread: RedditThread) => (
                <OpportunityCard 
                  key={thread.id} 
                  thread={thread} 
                  onClick={() => onThreadClick(thread)}
                />
              ))
            ) : (
              <li className="px-4 py-8 text-center">
                <p className="text-neutral-500">No opportunities found matching your criteria.</p>
              </li>
            )}
          </ul>
          
          {data?.threads?.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="ml-3"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-700">
                    Showing{" "}
                    <span className="font-medium">{Math.min(currentOffset + 1, data.total)}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentOffset + pageSize, data.total)}
                    </span>{" "}
                    of <span className="font-medium">{data.total}</span> results
                  </p>
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => onPageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {generatePaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => onPageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper button component for mobile pagination
function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }) {
  return (
    <button
      className={`relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
