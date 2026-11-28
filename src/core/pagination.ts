// pageWindow lists the first, last and nearby pages, with null where pages are skipped.
export function pageWindow(page: number, totalPages: number): (number | null)[] {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((entry) => entry >= 1 && entry <= totalPages)
    .sort((a, b) => a - b);
  return pages.flatMap((entry, index) => {
    const previous = pages[index - 1];
    return previous !== undefined && entry - previous > 1 ? [null, entry] : [entry];
  });
}
