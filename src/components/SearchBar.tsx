import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

interface SearchBarProps {
  defaultValue?: string;
  size?: "default" | "large";
}

export default function SearchBar({ defaultValue = "", size = "default" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`relative flex items-center transition-all duration-300 ${
          isLarge ? "max-w-2xl mx-auto" : "max-w-xl"
        }`}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索书名、作者..."
          className={`w-full bg-white border-2 border-paper-dark rounded-full text-ink placeholder:text-ink/40 outline-none transition-all duration-300 focus:border-brick focus:shadow-lg ${
            isLarge ? "py-4 pl-14 pr-6 text-lg" : "py-2.5 pl-10 pr-4 text-base"
          }`}
        />
        <Search
          className={`absolute text-ink/40 transition-colors ${
            isLarge ? "left-5 w-6 h-6" : "left-3.5 w-5 h-5"
          }`}
        />
        <button
          type="submit"
          className={`absolute right-1.5 bg-ink text-white rounded-full font-medium hover:bg-ink-light transition-colors ${
            isLarge ? "px-6 py-2.5 text-base" : "px-4 py-1.5 text-sm"
          }`}
        >
          搜索
        </button>
      </div>
    </form>
  );
}
