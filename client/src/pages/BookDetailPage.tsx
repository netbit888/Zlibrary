import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, BookOpen, Globe, Building, FileText } from "lucide-react";
import StarRating from "@/components/StarRating";
import DownloadButton from "@/components/DownloadButton";
import { getBookById } from "@/services/api";
import type { Book } from "@/types";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getBookById(id).then((b) => {
        setBook(b || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-10 animate-pulse">
          <div className="w-full md:w-72 shrink-0">
            <div className="aspect-[2/3] bg-paper-dark rounded-xl" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-paper-dark rounded w-2/3" />
            <div className="h-5 bg-paper-dark rounded w-1/3" />
            <div className="h-4 bg-paper-dark rounded w-1/2" />
            <div className="h-32 bg-paper-dark rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <BookOpen className="w-16 h-16 text-ink/20 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-ink mb-2">
          书籍未找到
        </h2>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brick hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-[calc(100vh-4rem)]">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-brick transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Cover */}
        <div className="w-full md:w-72 shrink-0">
          <div className="rounded-xl overflow-hidden shadow-book bg-paper-dark">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full aspect-[2/3] object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium text-brick bg-brick/10 px-2.5 py-1 rounded-full">
              {book.category}
            </span>
            <span className="text-xs text-ink/40">
              {(book.downloads / 1000).toFixed(0)}k 次下载
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2 leading-tight">
            {book.title}
          </h1>
          <p className="text-lg text-ink/70 mb-4">{book.author}</p>

          <div className="mb-6">
            <StarRating rating={book.rating} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <Building className="w-4 h-4 text-brick shrink-0" />
              <span className="truncate">{book.publisher}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <Calendar className="w-4 h-4 text-brick shrink-0" />
              <span>{book.year} 年</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <FileText className="w-4 h-4 text-brick shrink-0" />
              <span>{book.pages} 页</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <Globe className="w-4 h-4 text-brick shrink-0" />
              <span>{book.language}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <BookOpen className="w-4 h-4 text-brick shrink-0" />
              <span>{book.formats.map((f) => f.toUpperCase()).join(" / ")}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-display font-bold text-ink mb-2 text-lg">
              简介
            </h3>
            <p className="text-ink/70 leading-relaxed">{book.description}</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-ink mb-3 text-lg">
              下载
            </h3>
            <DownloadButton formats={book.formats} title={book.title} bookId={book.id} pdf_url={book.pdf_url} epub_url={book.epub_url} mobi_url={book.mobi_url} />
          </div>
        </div>
      </div>
    </div>
  );
}
