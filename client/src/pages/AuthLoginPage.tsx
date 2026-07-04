import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore, useAuthError, useAuthLoading } from "@/store/useAuthStore";
import { authService, authUtils } from "@/services/auth";
import { BookOpen, Mail, Lock, User, LogIn } from "lucide-react";
import Toast from "@/components/Toast";
import { useBookStore } from "@/store/useBookStore";

export default function AuthLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const error = useAuthError();
  const isLoading = useAuthLoading();
  const addToast = useBookStore((state) => state.addToast);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 从URL参数中获取重定向路径
  const from = (location.state as any)?.from?.pathname || "/";

  // 如果已登录，自动跳转到首页
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  useEffect(() => {
    // 如果有错误，显示Toast提示
    if (error) {
      addToast({
        message: error,
        type: "error",
      });
    }
  }, [error, addToast]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = "邮箱不能为空";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "请输入有效的邮箱地址";
    }

    if (mode === "register") {
      if (!formData.username.trim()) {
        errors.username = "用户名不能为空";
      } else if (formData.username.length < 2) {
        errors.username = "用户名至少需要2个字符";
      }
    }

    if (!formData.password) {
      errors.password = "密码不能为空";
    } else if (formData.password.length < 6) {
      errors.password = "密码至少需要6个字符";
    }

    if (mode === "register") {
      if (!formData.confirmPassword) {
        errors.confirmPassword = "请确认密码";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "两次输入的密码不一致";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "login") {
        await login(formData.email, formData.password, formData.rememberMe);
        addToast({
          message: "登录成功！",
          type: "success",
        });
        navigate(from, { replace: true });
      } else {
        // 调用注册API
        const result = await authService.register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
        
        // 注册成功，自动设置token和用户信息
        if (result.token) {
          setToken(result.token);
          setUser(result.user);
          authUtils.setAuth(result.token, result.user, formData.rememberMe);
        }
        
        addToast({
          message: "注册成功！欢迎加入Zlibrary",
          type: "success",
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("认证错误:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // 清除该字段的错误
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleModeToggle = () => {
    setMode(mode === "login" ? "register" : "login");
    setFormErrors({});
    setFormData({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 头部 */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === "login" ? "欢迎回来" : "加入Zlibrary"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "login" 
              ? "登录您的账户继续探索书籍世界" 
              : "创建新账户，开始您的阅读旅程"}
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
                    ${formErrors.email 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-primary focus:border-primary"
                    }`}
                  placeholder="your@email.com"
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* 用户名输入 (仅注册模式) */}
            {mode === "register" && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
                      ${formErrors.username 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-primary focus:border-primary"
                      }`}
                    placeholder="选择您的用户名"
                  />
                </div>
                {formErrors.username && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>
            )}

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
                    ${formErrors.password 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-primary focus:border-primary"
                    }`}
                  placeholder={mode === "login" ? "请输入密码" : "设置密码（至少6个字符）"}
                />
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* 确认密码 (仅注册模式) */}
            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
                      ${formErrors.confirmPassword 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-primary focus:border-primary"
                      }`}
                    placeholder="再次输入密码"
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* 记住我和忘记密码 (仅登录模式) */}
            {mode === "login" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    记住我
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    to="/auth/forgot-password"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    忘记密码？
                  </Link>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    {mode === "login" ? "登录账户" : "注册账户"}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* 模式切换 */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {mode === "login" ? "还没有账户？" : "已有账户？"}
                <button
                  type="button"
                  onClick={handleModeToggle}
                  className="ml-2 font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none"
                >
                  {mode === "login" ? "立即注册" : "立即登录"}
                </button>
              </p>
              <div className="mt-4">
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← 返回首页
                </Link>
              </div>
            </div>
          </div>

          {/* 协议说明 (仅注册模式) */}
          {mode === "register" && (
            <div className="mt-6">
              <p className="text-xs text-gray-500 text-center">
                点击"注册账户"即表示您同意我们的
                <Link to="/terms" className="ml-1 underline hover:text-gray-700">服务条款</Link>
                和
                <Link to="/privacy" className="ml-1 underline hover:text-gray-700">隐私政策</Link>
              </p>
            </div>
          )}
        </div>

        {/* 功能亮点 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl">
            <div className="text-lg font-semibold text-primary mb-1">10万+</div>
            <div className="text-xs text-gray-600">精选书籍</div>
          </div>
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl">
            <div className="text-lg font-semibold text-primary mb-1">PDF/EPUB</div>
            <div className="text-xs text-gray-600">多格式支持</div>
          </div>
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl">
            <div className="text-lg font-semibold text-primary mb-1">免费</div>
            <div className="text-xs text-gray-600">完全免费阅读</div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}