import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoList from "@/components/VideoList";
import BottomNavigation from "@/components/BottomNavigation";
import DottedBackground from "@/components/DottedBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import arabicBg from "@/assets/category-arabic.jpeg";
import biologyBg from "@/assets/category-biology.jpeg";
import englishBg from "@/assets/category-english.jpeg";
import chemistryBg from "@/assets/category-chemistry-new.jpeg";
import mathBg from "@/assets/category-math.jpeg";
import financeBg from "@/assets/category-finance.jpeg";

const Videos = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const categories = [
    { name: "عربي", image: arabicBg },
    { name: "English", image: englishBg },
    { name: "علوم حياتية", image: biologyBg },
    { name: "كيمياء", image: chemistryBg },
    { name: "رياضيات", image: mathBg },
    { name: "مالية", image: financeBg },
  ];

  if (loading) {
    return (
      <DottedBackground className="min-h-screen bg-background pb-20">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <BottomNavigation />
      </DottedBackground>
    );
  }

  return (
    <DottedBackground className="min-h-screen bg-background pb-20">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Video className="h-5 w-5 text-white" />
              </div>
              {t("student.videos")}
            </CardTitle>
            <CardDescription>{t("student.videos.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{t("student.filter")}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`relative h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 press-effect ${
                    selectedCategory === "all"
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-glow scale-105"
                      : "hover:scale-102"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">{t("student.all.categories")}</span>
                  </div>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`relative h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 press-effect ${
                      selectedCategory === cat.name
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-glow scale-105"
                        : "hover:scale-102"
                    }`}
                  >
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-2">
                      <span className="text-white font-bold text-sm sm:text-base drop-shadow-lg">{cat.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <VideoList
              userId={user?.id}
              isTeacher={false}
              selectedCategory={selectedCategory === "all" ? undefined : selectedCategory}
            />
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </DottedBackground>
  );
};

export default Videos;
