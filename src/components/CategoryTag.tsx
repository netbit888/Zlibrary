import { useNavigate } from "react-router-dom";

interface CategoryTagProps {
  name: string;
}

export default function CategoryTag({ name }: CategoryTagProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/search?category=${encodeURIComponent(name)}`)}
      className="px-5 py-2 bg-white border border-paper-dark rounded-full text-sm font-medium text-ink/80 hover:text-brick hover:border-brick hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
    >
      {name}
    </button>
  );
}
