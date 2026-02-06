import { PageButton } from "./PageButton";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) {
  const getPages = () => {
    const delta = 2;
    const pages: (number | string)[] = [];

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(lastPage, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    if (pages[0] !== 1) {
      pages.unshift("...");
      pages.unshift(1);
    }

    if (pages[pages.length - 1] !== lastPage) {
      pages.push("...");
      pages.push(lastPage);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 p-3">
      {/* Info */}
      <span className="text-sm text-gray-500">
        Page {currentPage} of {lastPage}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <PageButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ‹
        </PageButton>

        {getPages().map((page, index) =>
          page === "..." ? (
            <span
              key={index}
              className="px-2 text-gray-400"
            >
              …
            </span>
          ) : (
            <PageButton
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PageButton>
          )
        )}

        <PageButton
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          ›
        </PageButton>
      </div>
    </div>
  );
}
