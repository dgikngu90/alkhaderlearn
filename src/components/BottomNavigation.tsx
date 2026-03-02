import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, Video, Bot, Info, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNavigation = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: t("student.nav.hero") },
    { path: "/messages", icon: MessageSquare, label: t("messages") },
    { path: "/videos", icon: Video, label: t("student.nav.videos") },
    { path: "/assistant", icon: Bot, label: t("student.nav.assistant") },
    { path: "/about", icon: Info, label: t("student.nav.about") },
    { path: "/contact", icon: Phone, label: t("student.nav.contact") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-primary-foreground/10 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center min-w-[48px] px-2 py-1 transition-colors duration-200 press-effect ${
              location.pathname === item.path
                ? "text-primary-foreground"
                : "text-primary-foreground/60 hover:text-primary-foreground"
            }`}
          >
            <item.icon className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
