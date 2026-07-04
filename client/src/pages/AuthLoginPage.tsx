import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore, useAuthError, useAuthLoading } from "@/store/useAuthStore";
import { authService, authUtils } from "@/services/auth";
import { BookOpen, Mail, Lock, User, LogIn, ArrowRight } from "lucide-react";
import Toast from "@/components/Toast";
import { useBookStore } from "@/store/useBookStore";

export default function AuthLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
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
      addToast(error, "error");
    }
  }, [error, addToast]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // 简单验证
    if (!formData.email.trim()) {
      errors.email = "邮箱不能为空";
    }

    if (mode === "register" && !formData.username.trim()) {
      errors.username = "用户名不能为空";
    }

    if (!formData.password) {
      errors.password = "密码不能为空";
    }

    if (mode === "register" && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "两次密码不一致";
    }

    setFormErrors(errors);
    
    // 直接返回是否有错误，而不是依赖异步更新的formErrors
    const isValid = Object.keys(errors).length === 0;
    console.log("验证结果:", isValid, "errors:", errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("表单提交, mode:", mode, "formData:", formData);
    
    if (!validateForm()) {
      console.log("表单验证失败, errors:", formErrors);
      return;
    }

    try {
      if (mode === "login") {
        console.log("开始登录...");
        await login(formData.email, formData.password, formData.rememberMe);
        addToast("登录成功！", "success");
        navigate(from, { replace: true });
      } else {
        // 调用注册API
        console.log("开始注册, 发送数据:", {
          email: formData.email,
          username: formData.username,
          password: formData.password,
        });
        const result = await authService.register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        });
        
        // 注册成功，自动设置token和用户信息
        if (result.token) {
          setToken(result.token);
          setUser(result.user);
          authUtils.setAuth(result.token, result.user, formData.rememberMe);
        }
        
        addToast("注册成功！欢迎加入Zlibrary", "success");
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("认证错误详情:", err);
      const errorMessage = err.message || "操作失败，请检查网络连接或重试";
      addToast(errorMessage, "error");
      
      // 如果是注册模式，清空密码字段让用户重试
      if (mode === "register") {
        setFormData({
          ...formData,
          password: "",
          confirmPassword: "",
        });
      }
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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="w-8 h-8 text-brick" />
          <h1 className="font-display text-2xl font-bold text-ink">
            {mode === "login" ? "用户登录" : "用户注册"}
          </h1>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl shadow-book p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  name="email"
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-ink placeholder:text-ink/40 outline-none transition-colors
                    ${formErrors.email 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-paper-dark focus:border-brick"
                    }`}
                  autoFocus
                />
              </div>
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* 用户名输入 (仅注册模式) */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    name="username"
                    placeholder="选择您的用户名"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-ink placeholder:text-ink/40 outline-none transition-colors
                      ${formErrors.username 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-paper-dark focus:border-brick"
                      }`}
                  />
                </div>
                {formErrors.username && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.username}</p>
                )}
              </div>
            )}

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  name="password"
                  placeholder={mode === "login" ? "请输入密码" : "设置密码（至少6个字符）"}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-ink placeholder:text-ink/40 outline-none transition-colors
                    ${formErrors.password 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-paper-dark focus:border-brick"
                    }`}
                />
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* 确认密码 (仅注册模式) */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    name="confirmPassword"
                    placeholder="再次输入密码"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-ink placeholder:text-ink/40 outline-none transition-colors
                      ${formErrors.confirmPassword 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-paper-dark focus:border-brick"
                      }`}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* 记住我 (仅登录模式) */}
            {mode === "login" && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-brick border-paper-dark rounded focus:ring-brick"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-ink">
                  记住我
                </label>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-ink text-white rounded-lg font-medium hover:bg-ink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                "处理中..."
              ) : (
                <>
                  {mode === "login" ? "登录" : "注册"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 模式切换 */}
          <div className="mt-6 pt-6 border-t border-paper-dark">
            <div className="text-center">
              <p className="text-sm text-ink">
                {mode === "login" ? "还没有账户？" : "已有账户？"}
                <button
                  type="button"
                  onClick={handleModeToggle}
                  className="ml-1 font-medium text-brick hover:text-brick/80 transition-colors"
                >
                  {mode === "login" ? "立即注册" : "立即登录"}
                </button>
              </p>
              <div className="mt-4">
                <Link
                  to="/"
                  className="text-sm text-ink/60 hover:text-ink transition-colors"
                >
                  ← 返回首页
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}