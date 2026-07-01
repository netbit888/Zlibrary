import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, BookOpen } from "lucide-react";
import { adminLogin, setAdminToken } from "@/services/admin";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLogin(password);
      setAdminToken(res.token);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-book p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <BookOpen className="w-8 h-8 text-brick" />
            <h1 className="font-display text-2xl font-bold text-ink">
              管理员登录
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                管理员密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-paper-dark rounded-lg text-ink placeholder:text-ink/40 outline-none focus:border-brick transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 bg-ink text-white rounded-lg font-medium hover:bg-ink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
