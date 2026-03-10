import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, Video, Bot, ClipboardList } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNavigation = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: t("student.nav.hero"), gradient: "from-primary to-violet-500" },
    { path: "/messages", icon: MessageSquare, label: t("messages"), gradient: "from-accent to-fuchsia-500" },
    { path: "/quizzes", icon: ClipboardList, label: t("quiz.available"), gradient: "from-cyan-500 to-emerald-500" },
    { path: "/videos", icon: Video, label: t("student.nav.videos"), gradient: "from-amber-500 to-orange-500" },
    { path: "/assistant", icon: Bot, label: t("student.nav.assistant"), gradient: "from-violet-500 to-primary" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-primary/20">
      <div className="flex items-center justify-around px-2 py-2 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center min-w-[48px] px-2 py-1 transition-all duration-300 press-effect ${
              location.pathname === item.path
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              location.pathname === item.path
                ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                : "hover:bg-primary/10"
            }`}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium mt-1 whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
