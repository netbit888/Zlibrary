import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import type { Book } from "@/types";
import StarRating from "./StarRating";

interface BookCardProps {
  book: Book;
  index?: number;
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
  return (
    <Link
      to={`/book/${book.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      <div className="bg-white rounded-xl shadow-book overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-book-hover">
        <div className="relative aspect-[2/3] overflow-hidden bg-paper-dark">
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            <Download className="w-3 h-3" />
            {(book.downloads / 1000).toFixed(0)}k
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-ink text-base leading-tight line-clamp-2 mb-1 group-hover:text-brick transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-ink/60 mb-2 truncate">{book.author}</p>
          <div className="flex items-center justify-between">
            <StarRating rating={book.rating} size="sm" />
            <span className="text-xs text-ink/40 bg-paper px-2 py-0.5 rounded-full">
              {book.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
