import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoList from "@/components/VideoList";
import BottomNavigation from "@/components/BottomNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import arabicBg from "@/assets/category-arabic.jpeg";
import biologyBg from "@/assets/category-biology.jpeg";
import englishBg from "@/assets/category-english.jpeg";
import chemistryBg from "@/assets/category-chemistry-new.jpeg";
import mathBg from "@/assets/category-math.jpeg";
import financeBg from "@/assets/category-finance.jpeg";
import physicsBg from "@/assets/category-physics.jpeg";

const Videos = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  const categories = [
    { name: "عربي", image: arabicBg, color: "from-primary to-violet-500" },
    { name: "English", image: englishBg, color: "from-accent to-fuchsia-500" },
    { name: "علوم حياتية", image: biologyBg, color: "from-emerald-500 to-cyan-500" },
    { name: "كيمياء", image: chemistryBg, color: "from-amber-500 to-orange-500" },
    { name: "رياضيات", image: mathBg, color: "from-cyan-500 to-blue-500" },
    { name: "فيزياء", image: physicsBg, color: "from-indigo-500 to-purple-500" },
    { name: "مالية", image: financeBg, color: "from-violet-500 to-primary" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-orbs" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        <Card className="glass-vibrant border-border/50 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-accent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="gradient-text">{t("student.videos")}</span>
            </CardTitle>
            <CardDescription className="text-base">{t("student.videos.desc")}</CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 gradient-text">{t("student.filter")}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`relative h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 press-effect ${
                    selectedCategory === "all"
                      ? "ring-4 ring-primary/50 ring-offset-2 ring-offset-background shadow-glow scale-105"
                      : "hover:scale-102 hover:shadow-lg"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-500 to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base drop-shadow-lg">{t("student.all.categories")}</span>
                    <Sparkles className="absolute top-2 right-2 w-4 h-4 text-white/70 animate-pulse" />
                  </div>
                </button>
                {categories.map((cat, index) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`relative h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 press-effect ${
                      selectedCategory === cat.name
                        ? "ring-4 ring-primary/50 ring-offset-2 ring-offset-background shadow-glow scale-105"
                        : "hover:scale-102 hover:shadow-lg"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-2">
                      <span className="text-white font-bold text-sm sm:text-base drop-shadow-lg">{cat.name}</span>
                    </div>
                    {selectedCategory === cat.name && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-30`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <VideoList
              userId={userId}
              isTeacher={false}
              selectedCategory={selectedCategory === "all" ? undefined : selectedCategory}
            />
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Videos;
