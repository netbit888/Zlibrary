import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import BookCard from "@/components/BookCard";
import { searchBooks, getCategories } from "@/services/api";
import type { Book } from "@/types";

export default function SearchPage() {
  const [urlParams] = useSearchParams();
  const q = urlParams.get("q") || "";
  const categoryParam = urlParams.get("category") || "";

  const query = q;
  const [categories, setCategories] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");

  const doSearch = useCallback(
    async (p = page) => {
      setLoading(true);
      const { books: result, total: t } = await searchBooks({
        q: query,
        category: selectedCategory || undefined,
        formats: selectedFormats.length > 0 ? selectedFormats : undefined,
        sortBy: sortBy as any,
        page: p,
      });
      setBooks(result);
      setTotal(t);
      setLoading(false);
    },
    [query, selectedCategory, selectedFormats, sortBy, page]
  );

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setPage(1);
    doSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCategory, selectedFormats, sortBy]);

  useEffect(() => {
    doSearch(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFormatChange = (fmt: string) => {
    setSelectedFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <SearchBar defaultValue={query} />
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          selectedFormats={selectedFormats}
          sortBy={sortBy}
          onCategoryChange={setSelectedCategory}
          onFormatChange={handleFormatChange}
          onSortChange={setSortBy}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
              <Search className="w-5 h-5 text-brick" />
              {query ? `「${query}」的搜索结果` : "全部书籍"}
            </h2>
            <span className="text-sm text-ink/50">
              共 {total} 本
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-book overflow-hidden animate-pulse"
                >
                  <div className="aspect-[2/3] bg-paper-dark" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-paper-dark rounded w-3/4" />
                    <div className="h-3 bg-paper-dark rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="w-16 h-16 text-ink/20 mb-4" />
              <p className="text-lg text-ink/60 font-medium">未找到相关书籍</p>
              <p className="text-sm text-ink/40 mt-1">
                尝试更换关键词或调整筛选条件
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {books.map((book, index) => (
                  <BookCard key={book.id} book={book} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-paper-dark bg-white text-ink hover:bg-paper-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - page) <= 1
                    )
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2 text-ink/30">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? "bg-ink text-white"
                              : "bg-white text-ink border border-paper-dark hover:bg-paper-dark"
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-paper-dark bg-white text-ink hover:bg-paper-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
