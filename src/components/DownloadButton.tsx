import { useState } from "react";
import { Download, FileText, BookOpen, Tablet } from "lucide-react";
import { useBookStore } from "@/store/useBookStore";

interface DownloadButtonProps {
  formats: ("pdf" | "epub" | "mobi")[];
  title: string;
}

const formatIcons = {
  pdf: FileText,
  epub: BookOpen,
  mobi: Tablet,
};

const formatLabels = {
  pdf: "PDF",
  epub: "EPUB",
  mobi: "MOBI",
};

export default function DownloadButton({ formats, title }: DownloadButtonProps) {
  const [clicked, setClicked] = useState<string | null>(null);
  const addToast = useBookStore((s) => s.addToast);

  const handleDownload = (fmt: string) => {
    setClicked(fmt);
    addToast(`《${title}》${formatLabels[fmt as keyof typeof formatLabels]} 下载已开始`, "success");
    setTimeout(() => setClicked(null), 300);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {formats.map((fmt) => {
        const Icon = formatIcons[fmt];
        const isClicked = clicked === fmt;
        return (
          <button
            key={fmt}
            onClick={() => handleDownload(fmt)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-brick hover:bg-brick-hover shadow-book hover:shadow-book-hover transition-all duration-200 ${
              isClicked ? "animate-pulse-scale" : ""
            }`}
          >
            <Icon className="w-4 h-4" />
            下载 {formatLabels[fmt]}
          </button>
        );
      })}
    </div>
  );
}
