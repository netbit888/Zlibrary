import { useState } from "react";
import { Download, FileText, BookOpen, Tablet } from "lucide-react";
import { useBookStore } from "@/store/useBookStore";

interface DownloadButtonProps {
  formats: ("pdf" | "epub" | "mobi")[];
  title: string;
  bookId: string;
  pdf_url?: string;
  epub_url?: string;
  mobi_url?: string;
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

export default function DownloadButton({ formats, title, bookId, pdf_url, epub_url, mobi_url }: DownloadButtonProps) {
  const [clicked, setClicked] = useState<string | null>(null);
  const addToast = useBookStore((s) => s.addToast);

  const handleDownload = async (fmt: string) => {
    const urlKey = `${fmt}_url`;
    const fileUrl = { pdf: pdf_url, epub: epub_url, mobi: mobi_url }[fmt as keyof typeof formatLabels];

    if (!fileUrl) {
      addToast("该格式文件不存在", "error");
      return;
    }

    setClicked(fmt);

    try {
      const response = await fetch(`/api/books/${bookId}/download/${fmt}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "下载失败");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${title}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      addToast(`《${title}》${formatLabels[fmt as keyof typeof formatLabels]} 下载已完成`, "success");
    } catch (err: any) {
      addToast(err.message || "下载失败", "error");
    } finally {
      setTimeout(() => setClicked(null), 300);
    }
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
