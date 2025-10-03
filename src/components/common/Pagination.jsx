export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
  loading = false
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Don't render if only one page or no items
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    onPageChange(pageNum);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if less than maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page with context
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = maxVisible;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisible + 1;
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <div className="pagination-info">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      <div className="pagination-controls">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
          className="btn btn-secondary btn-sm"
          aria-label="Previous page"
          data-testid="pagination-prev"
        >
          Previous
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                disabled={loading}
                className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
                data-testid={`pagination-page-${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
          className="btn btn-secondary btn-sm"
          aria-label="Next page"
          data-testid="pagination-next"
        >
          Next
        </button>
      </div>

      {/* Mobile "Load More" button */}
      <div className="pagination-mobile">
        {currentPage < totalPages && (
          <button
            onClick={handleNext}
            disabled={loading}
            className="btn btn-primary btn-block"
            data-testid="load-more-btn"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
}
