import { Link } from "react-router-dom";
import { BookOpen, Search, User, LogOut, UserCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-paper-dark">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="w-7 h-7 text-brick transition-transform group-hover:scale-110" />
          <span className="font-display text-xl font-bold text-ink tracking-tight">
            Zlibrary
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-ink/70 hover:text-brick transition-colors"
          >
            首页
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-brick transition-colors"
          >
            <Search className="w-4 h-4" />
            搜索
          </Link>
          
          {/* 用户登录入口 */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-brick transition-colors"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-5 h-5" />
                )}
                <span>{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-brick transition-colors"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-brick transition-colors"
            >
              <User className="w-4 h-4" />
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
