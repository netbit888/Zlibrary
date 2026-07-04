import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Download, 
  Heart, 
  BookOpen, 
  Settings,
  LogOut,
  Camera,
  Edit2,
  Save,
  X
} from "lucide-react";
import { useAuthStore, useCurrentUser } from "@/store/useAuthStore";
import { useBookStore } from "@/store/useBookStore";
import Toast from "@/components/Toast";
import { Link } from "react-router-dom";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const addToast = useBookStore((state) => state.addToast);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
  });
  const [stats, setStats] = useState({
    favorites: 24,
    downloads: 156,
    readingTime: 128,
  });

  // 用户收藏和下载历史的模拟数据
  const [recentActivity, setRecentActivity] = useState([
    { id: "1", type: "favorite", bookTitle: "百年孤独", date: "2024-01-15", icon: Heart },
    { id: "2", type: "download", bookTitle: "三体", date: "2024-01-14", icon: Download, format: "PDF" },
    { id: "3", type: "favorite", bookTitle: "人类简史", date: "2024-01-12", icon: Heart },
    { id: "4", type: "download", bookTitle: "设计心理学", date: "2024-01-10", icon: Download, format: "EPUB" },
    { id: "5", type: "download", bookTitle: "活着", date: "2024-01-08", icon: Download, format: "PDF" },
  ]);

  useEffect(() => {
    if (!user) {
      navigate("/auth/login", { state: { from: location } });
      return;
    }

    // 初始化编辑表单
    setEditForm({
      username: user.username,
      bio: user.bio || "",
    });

    // 这里应该通过API获取用户统计数据
    // fetchUserStats();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    addToast({
      message: "已成功退出登录",
      type: "success",
    });
    navigate("/");
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        username: editForm.username,
        bio: editForm.bio,
      });
      
      setIsEditing(false);
      addToast({
        message: "个人资料已更新",
        type: "success",
      });
    } catch (error) {
      addToast({
        message: "更新失败，请重试",
        type: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: user?.username || "",
      bio: user?.bio || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    // 头像上传功能
    addToast({
      message: "头像上传功能即将推出",
      type: "info",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 返回导航 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧个人信息栏 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 个人信息卡片 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col items-center">
                {/* 头像区域 */}
                <div className="relative mb-6">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user.username.charAt(0)}
                  </div>
                  <button
                    onClick={handleAvatarUpload}
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Camera className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* 用户信息 */}
                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        用户名
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="请输入用户名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人简介
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="介绍一下你自己..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {user.username}
                    </h2>
                    {user.bio && (
                      <p className="text-gray-600 text-center mb-4">{user.bio}</p>
                    )}
                    <div className="flex items-center justify-center text-gray-500 mb-6">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{user.email}</span>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      编辑资料
                    </button>
                  </>
                )}
              </div>

              {/* 角色标签 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">账户类型</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>注册日期</span>
                  <span>{new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-6">阅读统计</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 mr-3" />
                    <span>收藏书籍</span>
                  </div>
                  <span className="text-xl font-bold">{stats.favorites}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Download className="h-5 w-5 mr-3" />
                    <span>下载次数</span>
                  </div>
                  <span className="text-xl font-bold">{stats.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-3" />
                    <span>阅读时长</span>
                  </div>
                  <span className="text-xl font-bold">{stats.readingTime}h</span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-3">
                <Link
                  to="/favorites"
                  className="flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 mr-3 text-red-500" />
                    <span>我的收藏</span>
                  </div>
                  <div className="text-gray-400">→</div>
                </Link>
                <Link
                  to="/downloads"
                  className="flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Download className="h-5 w-5 mr-3 text-blue-500" />
                    <span>下载历史</span>
                  </div>
                  <div className="text-gray-400">→</div>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 mr-3 text-gray-500" />
                    <span>账户设置</span>
                  </div>
                  <div className="text-gray-400">→</div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>退出登录</span>
                  </div>
                  <div className="text-red-400">→</div>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 近期活动 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">近期活动</h3>
                <Link
                  to="/activity"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  查看全部 →
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="mr-4">
                      <div className="p-2 rounded-full bg-gray-100">
                        <activity.icon className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {activity.type === 'favorite' 
                          ? `收藏了《${activity.bookTitle}》`
                          : `下载了《${activity.bookTitle}》`
                        }
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {activity.date}
                        {activity.type === 'download' && activity.format && (
                          <span className="ml-4">
                            格式：<span className="font-medium">{activity.format}</span>
                          </span>
                        )}
                      </p>
                    </div>
                    <Link
                      to={`/book/${activity.id}`}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      查看
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* 阅读偏好 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">阅读偏好</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { category: "文学", count: 12, color: "bg-blue-100 text-blue-800" },
                  { category: "科技", count: 8, color: "bg-green-100 text-green-800" },
                  { category: "历史", count: 5, color: "bg-yellow-100 text-yellow-800" },
                  { category: "艺术", count: 3, color: "bg-purple-100 text-purple-800" },
                  { category: "哲学", count: 2, color: "bg-pink-100 text-pink-800" },
                  { category: "其他", count: 1, color: "bg-gray-100 text-gray-800" },
                ].map((pref) => (
                  <div
                    key={pref.category}
                    className="p-4 border border-gray-200 rounded-lg text-center"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${pref.color} mb-3`}>
                      <span className="font-bold text-lg">{pref.count}</span>
                    </div>
                    <h4 className="font-medium text-gray-900">{pref.category}</h4>
                  </div>
                ))}
              </div>
            </div>

            {/* 阅读目标 */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">2024年阅读目标</h3>
                  <p className="text-indigo-100">坚持阅读，成就更好的自己</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="text-3xl font-bold">12</span>
                  <span className="text-indigo-200">/ 52 本</span>
                </div>
              </div>
              
              {/* 进度条 */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>年度进度</span>
                  <span>23%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: "23%" }}></div>
                </div>
              </div>
              
              {/* 月度目标 */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">4</div>
                  <div className="text-xs text-white/80">本月已读</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">8</div>
                  <div className="text-xs text-white/80">本月目标</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">50%</div>
                  <div className="text-xs text-white/80">完成度</div>
                </div>
              </div>
            </div>

            {/* 系统通知 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">系统通知</h3>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="mr-3">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">欢迎使用全新功能！</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      您现在可以使用书籍收藏功能和在线阅读进度同步功能了。
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-green-50 border border-green-100 rounded-lg">
                  <div className="mr-3">
                    <Download className="h-5 w-5 text-green-500 mt-0.5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">下载限制更新</h4>
                    <p className="text-sm text-green-700 mt-1">
                      普通用户每日下载次数限制已提升至10次。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}