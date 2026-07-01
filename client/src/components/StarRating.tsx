import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

export default function StarRating({ rating, size = "md" }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => {
        const filled = s <= Math.round(rating);
        return (
          <Star
            key={s}
            className={`${iconSize} ${
              filled ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        );
      })}
      <span className={`ml-1 text-ink/70 ${size === "sm" ? "text-xs" : "text-sm"}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
