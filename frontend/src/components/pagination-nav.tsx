import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

function buildPageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  const pages = [...new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))].sort(
    (a, b) => a - b
  );
  const items: (number | "ellipsis")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - (pages[i - 1] ?? 0) > 1) items.push("ellipsis");
    items.push(p);
  });
  return items;
}

export function PaginationNav({
  page,
  totalPages,
  basePath,
  paramName = "page",
  extraParams,
  hash,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  paramName?: string;
  extraParams?: Record<string, string>;
  /** Optional fragment so paging keeps the section in view (e.g. "cards"). */
  hash?: string;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams(extraParams);
    if (target > 1) params.set(paramName, String(target));
    else params.delete(paramName);
    const query = params.toString();
    const path = query ? `${basePath}?${query}` : basePath;
    return hash ? `${path}#${hash}` : path;
  }

  const items = buildPageItems(page, totalPages);

  return (
    <Pagination className="mt-4">
      <PaginationContent className="flex-wrap justify-center gap-1">
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={hrefFor(page - 1)} className="border-2 border-black bg-white shadow-[2px_2px_0_0_#000]" />
          ) : (
            <PaginationPrevious
              href={hrefFor(1)}
              aria-disabled
              className="pointer-events-none border-2 border-black/20 bg-white opacity-40"
            />
          )}
        </PaginationItem>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`e-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={hrefFor(item)}
                isActive={item === page}
                className={
                  item === page
                    ? "border-2 border-black bg-brand-red text-white shadow-[2px_2px_0_0_#000]"
                    : "border-2 border-black bg-white shadow-[2px_2px_0_0_#000]"
                }
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          {page < totalPages ? (
            <PaginationNext href={hrefFor(page + 1)} className="border-2 border-black bg-white shadow-[2px_2px_0_0_#000]" />
          ) : (
            <PaginationNext
              href={hrefFor(totalPages)}
              aria-disabled
              className="pointer-events-none border-2 border-black/20 bg-white opacity-40"
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
