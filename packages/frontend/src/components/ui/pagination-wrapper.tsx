"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

interface PaginationInfoProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export function PaginationWrapper({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationWrapperProps): React.JSX.Element {
  const generatePageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Show ellipsis or pages around current page
      if (currentPage <= 4) {
        // Current page is near the beginning
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      } else if (currentPage >= totalPages - 3) {
        // Current page is near the end
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // Current page is in the middle
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return <div />; // Don't render pagination if there's only one page or no pages
  }

  const pageNumbers = generatePageNumbers();

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            aria-disabled={currentPage <= 1}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(page as number)}
                isActive={currentPage === page}
                className="cursor-pointer"
                aria-label={`Go to page ${page}`}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            aria-disabled={currentPage >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function PaginationInfo({
  totalItems,
  itemsPerPage,
  currentPage,
}: PaginationInfoProps): React.JSX.Element {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return (
      <p className="min-text-caption text-muted-foreground">No items found</p>
    );
  }

  return (
    <p className="min-text-caption text-muted-foreground">
      Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{" "}
      {totalItems.toLocaleString()} items
    </p>
  );
}
