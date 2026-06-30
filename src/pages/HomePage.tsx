import { useEffect, useState } from "react";
import { BookOpen, TrendingUp } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryTag from "@/components/CategoryTag";
import BookCard from "@/components/BookCard";
import {
  getCategories,
  getPopularBooks,
} from "@/services/api";
import type { Book } from "@/types";

export default function HomePage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getPopularBooks()]).then(([cats, books]) => {
      setCategories(cats);
      setPopularBooks(books);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
        <div className="relative container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-10 h-10 text-brick" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight">
              Zlibrary
            </h1>
          </div>
          <p className="text-lg md:text-xl text-ink/60 mb-10 max-w-xl mx-auto">
            发现下一本改变你人生的好书
          </p>
          <SearchBar size="large" />
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <h2 className="font-display text-2xl font-bold text-ink mb-6 text-center">
            浏览分类
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <CategoryTag key={cat} name={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Books */}
      <section className="py-10 px-4 flex-1">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6 text-brick" />
            <h2 className="font-display text-2xl font-bold text-ink">
              热门推荐
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-book overflow-hidden animate-pulse"
                >
                  <div className="aspect-[2/3] bg-paper-dark" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-paper-dark rounded w-3/4" />
                    <div className="h-3 bg-paper-dark rounded w-1/2" />
                    <div className="h-3 bg-paper-dark rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
