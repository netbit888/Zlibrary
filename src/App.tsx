import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import BookDetailPage from "@/pages/BookDetailPage";
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLoginPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
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
