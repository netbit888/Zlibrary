import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  selectedFormats: string[];
  sortBy: string;
  onCategoryChange: (cat: string) => void;
  onFormatChange: (fmt: string) => void;
  onSortChange: (sort: string) => void;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  selectedFormats,
  sortBy,
  onCategoryChange,
  onFormatChange,
  onSortChange,
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const formatOptions = [
    { value: "pdf", label: "PDF" },
    { value: "epub", label: "EPUB" },
    { value: "mobi", label: "MOBI" },
  ];

  const sortOptions = [
    { value: "relevance", label: "相关度" },
    { value: "rating", label: "评分" },
    { value: "newest", label: "最新" },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-display font-bold text-ink mb-3 text-sm uppercase tracking-wider">
          排序
        </h4>
        <div className="space-y-1.5">
          {sortOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={sortBy === opt.value}
                onChange={() => onSortChange(opt.value)}
                className="w-4 h-4 accent-brick cursor-pointer"
              />
              <span className="text-sm text-ink/80 group-hover:text-brick transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display font-bold text-ink mb-3 text-sm uppercase tracking-wider">
          分类
        </h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="category"
              value=""
              checked={selectedCategory === ""}
              onChange={() => onCategoryChange("")}
              className="w-4 h-4 accent-brick cursor-pointer"
            />
            <span className="text-sm text-ink/80 group-hover:text-brick transition-colors">
              全部
            </span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                value={cat}
                checked={selectedCategory === cat}
                onChange={() => onCategoryChange(cat)}
                className="w-4 h-4 accent-brick cursor-pointer"
              />
              <span className="text-sm text-ink/80 group-hover:text-brick transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display font-bold text-ink mb-3 text-sm uppercase tracking-wider">
          格式
        </h4>
        <div className="space-y-1.5">
          {formatOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                value={opt.value}
                checked={selectedFormats.includes(opt.value)}
                onChange={() => onFormatChange(opt.value)}
                className="w-4 h-4 accent-brick rounded cursor-pointer"
              />
              <span className="text-sm text-ink/80 group-hover:text-brick transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-paper-dark rounded-lg text-sm font-medium text-ink mb-4"
      >
        <SlidersHorizontal className="w-4 h-4" />
        筛选
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 bg-white rounded-xl shadow-book p-5">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-paper shadow-2xl p-6 overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-ink">筛选</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-full hover:bg-paper-dark transition-colors"
              >
                <X className="w-5 h-5 text-ink/60" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}
