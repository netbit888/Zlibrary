import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brick" />
            <span className="font-display text-lg font-bold text-white">
              Zlibrary
            </span>
          </div>
          <p className="text-sm flex items-center gap-1">
            用心打造 · 仅供学习交流
          </p>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Zlibrary. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
