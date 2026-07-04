import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import BookDetailPage from "@/pages/BookDetailPage";
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLoginPage";

// Lazy-load pages for better performance
const LazyAdminPage = lazy(() => import("@/pages/AdminPage"));
const LazyAdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));
const LazyAuthLoginPage = lazy(() => import("@/pages/AuthLoginPage"));
const LazyUserProfilePage = lazy(() => import("@/pages/UserProfilePage"));

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Zlibrary - 免费电子书下载",
      "/search": "搜索结果 - Zlibrary",
      "/admin": "管理后台 - Zlibrary",
      "/admin/login": "登录 - Zlibrary",
      "/auth/login": "用户登录 - Zlibrary",
      "/profile": "用户资料 - Zlibrary",
    };
    let title = titles[location.pathname] || "Zlibrary";
    if (location.pathname.startsWith("/book/")) {
      title = "图书详情 - Zlibrary";
    }
    document.title = title;
  }, [location]);
  return null;
}

export default function App() {
  return (
    <Router>
      <TitleUpdater />
      <Routes>
        <Route path="/admin/login" element={(
          <Suspense fallback={<div>加载中...</div>}>
            <LazyAdminLoginPage />
          </Suspense>
        )} />
        <Route path="/admin" element={(
          <Suspense fallback={<div>加载中...</div>}>
            <LazyAdminPage />
          </Suspense>
        )} />
        <Route path="/auth/login" element={(
          <Suspense fallback={<div>加载中...</div>}>
            <LazyAuthLoginPage />
          </Suspense>
        )} />
        <Route path="/profile" element={(
          <Suspense fallback={<div>加载中...</div>}>
            <LazyUserProfilePage />
          </Suspense>
        )} />
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen bg-paper">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/book/:id" element={<BookDetailPage />} />
                </Routes>
              </main>
              <Footer />
              <Toast />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
