import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  BookOpen,
  Upload,
  X,
} from "lucide-react";
import {
  adminGetBooks,
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
  adminUploadFile,
  clearAdminToken,
  getAdminToken,
} from "@/services/admin";
import type { Book } from "@/services/api";

const defaultForm = {
  title: "",
  author: "",
  cover: "",
  publisher: "",
  year: "",
  pages: "",
  language: "中文",
  rating: "",
  downloads: "",
  category: "",
  formats: [] as string[],
  description: "",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState<typeof defaultForm>({ ...defaultForm });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBook, setUploadingBook] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetBooks({ q: query, page, pageSize: 10 });
      setBooks(res.books);
      setTotal(res.total);
    } catch (err: any) {
      if (err.message === "未授权") {
        clearAdminToken();
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [query, page, navigate]);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/admin/login");
      return;
    }
    loadBooks();
  }, [loadBooks, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...defaultForm });
    setShowModal(true);
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author,
      cover: book.cover,
      publisher: book.publisher,
      year: String(book.year),
      pages: String(book.pages),
      language: book.language,
      rating: String(book.rating),
      downloads: String(book.downloads),
      category: book.category,
      formats: [...book.formats],
      description: book.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (book: Book) => {
    if (!confirm(`确定要删除《${book.title}》吗？`)) return;
    try {
      await adminDeleteBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      setTotal((t) => t - 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author) {
      alert("书名和作者必填");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        year: parseInt(form.year, 10) || 0,
        pages: parseInt(form.pages, 10) || 0,
        rating: parseFloat(form.rating) || 0,
        downloads: parseInt(form.downloads, 10) || 0,
      };
      if (editing) {
        await adminUpdateBook(editing.id, payload);
      } else {
        await adminCreateBook(payload);
      }
      setShowModal(false);
      loadBooks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await adminUploadFile(file, "cover");
      setForm((prev) => ({ ...prev, cover: res.url }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleBookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBook(true);
    try {
      const res = await adminUploadFile(file, "book");
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext && ["pdf", "epub", "mobi"].includes(ext)) {
        setForm((prev) => ({
          ...prev,
          formats: prev.formats.includes(ext) ? prev.formats : [...prev.formats, ext],
        }));
      }
      alert(`上传成功: ${res.filename}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingBook(false);
    }
  };

  const toggleFormat = (fmt: string) => {
    setForm((prev) => ({
      ...prev,
      formats: prev.formats.includes(fmt)
        ? prev.formats.filter((f) => f !== fmt)
        : [...prev.formats, fmt],
    }));
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin/login");
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-paper">
      {/* 顶栏 */}
      <header className="sticky top-0 z-40 bg-ink text-white shadow-lg">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brick" />
            <span className="font-display font-bold text-lg">Zlibrary 管理后台</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索书名、作者..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-paper-dark rounded-lg text-ink placeholder:text-ink/40 outline-none focus:border-brick transition-colors"
              />
            </div>
          </form>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brick text-white rounded-lg font-medium hover:bg-brick-hover transition-colors shadow-book"
          >
            <Plus className="w-5 h-5" />
            新增图书
          </button>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-xl shadow-book overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper text-ink/70">
                  <th className="text-left px-4 py-3 font-semibold w-16">封面</th>
                  <th className="text-left px-4 py-3 font-semibold">书名</th>
                  <th className="text-left px-4 py-3 font-semibold w-28">作者</th>
                  <th className="text-left px-4 py-3 font-semibold w-20">分类</th>
                  <th className="text-left px-4 py-3 font-semibold w-20">评分</th>
                  <th className="text-left px-4 py-3 font-semibold w-24">格式</th>
                  <th className="text-right px-4 py-3 font-semibold w-28">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-ink/40">
                      加载中...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-ink/40">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr
                      key={book.id}
                      className="border-t border-paper-dark hover:bg-paper/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {book.cover ? (
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-paper-dark rounded" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{book.title}</td>
                      <td className="px-4 py-3 text-ink/70">{book.author}</td>
                      <td className="px-4 py-3 text-ink/70">{book.category}</td>
                      <td className="px-4 py-3 text-ink/70">{book.rating}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {book.formats.join(" / ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(book)}
                            className="p-1.5 text-ink/60 hover:text-ink hover:bg-paper rounded transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(book)}
                            className="p-1.5 text-red-500/70 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-paper-dark">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-paper-dark rounded hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-ink/60 px-2">
                第 {page} / {totalPages} 页，共 {total} 条
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-paper-dark rounded hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-book w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in-up" style={{ opacity: 0 }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-paper-dark">
              <h2 className="font-display text-xl font-bold text-ink">
                {editing ? "编辑图书" : "新增图书"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-paper transition-colors"
              >
                <X className="w-5 h-5 text-ink/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink mb-1">
                    书名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink mb-1">
                    作者 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">分类</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">出版社</label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">出版年份</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">页数</label>
                  <input
                    type="number"
                    value={form.pages}
                    onChange={(e) => setForm({ ...form, pages: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">评分</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">下载量</label>
                  <input
                    type="number"
                    value={form.downloads}
                    onChange={(e) => setForm({ ...form, downloads: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">语言</label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">格式</label>
                  <div className="flex gap-2">
                    {["pdf", "epub", "mobi"].map((fmt) => (
                      <label
                        key={fmt}
                        className={`flex items-center justify-center flex-1 px-2 py-2 text-sm rounded-lg cursor-pointer border-2 transition-colors ${
                          form.formats.includes(fmt)
                            ? "border-brick bg-brick/10 text-brick"
                            : "border-paper-dark text-ink/60 hover:border-ink/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.formats.includes(fmt)}
                          onChange={() => toggleFormat(fmt)}
                          className="hidden"
                        />
                        {fmt.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-ink mb-1">封面</label>
                <div className="flex gap-4">
                  <div className="w-24 h-36 bg-paper-dark rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {form.cover ? (
                      <img
                        src={form.cover}
                        alt="封面"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-ink/40">无封面</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-paper-dark rounded-lg text-sm text-ink/60 hover:border-brick hover:text-brick cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploadingCover ? "上传中..." : "上传封面图片"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                        disabled={uploadingCover}
                      />
                    </label>
                    <input
                      type="text"
                      value={form.cover}
                      onChange={(e) => setForm({ ...form, cover: e.target.value })}
                      placeholder="或输入封面 URL"
                      className="w-full mt-2 px-3 py-2 border-2 border-paper-dark rounded-lg text-sm text-ink outline-none focus:border-brick transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-ink mb-1">电子书文件</label>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-paper-dark rounded-lg text-sm text-ink/60 hover:border-brick hover:text-brick cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploadingBook ? "上传中..." : "上传电子书文件 (PDF/EPUB/MOBI)"}
                  <input
                    type="file"
                    accept=".pdf,.epub,.mobi"
                    onChange={handleBookUpload}
                    className="hidden"
                    disabled={uploadingBook}
                  />
                </label>
                <p className="text-xs text-ink/40 mt-1">
                  上传后会自动添加对应格式到上方格式选项中
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-ink mb-1">简介</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-paper-dark rounded-lg text-ink outline-none focus:border-brick transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-ink/70 hover:text-ink transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-brick text-white rounded-lg font-medium hover:bg-brick-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? "保存中..." : editing ? "保存修改" : "添加图书"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
