import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import StudentQuizList from "@/components/StudentQuizList";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ClipboardList, Sparkles, Trophy, Zap, Target, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Quizzes = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-violet-500 animate-spin flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-orbs" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl animate-float-reverse" />
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="glass-vibrant overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-accent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <span className="gradient-text">{t("quiz.available")}</span>
              </CardTitle>
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <CardDescription className="text-base">{t("quiz.availableDesc")}</CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-3 text-center border border-amber-500/20">
                <Trophy className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <p className="text-xs text-muted-foreground">{t("quiz.points") || "Points"}</p>
                <p className="font-bold text-amber-600">0</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl p-3 text-center border border-emerald-500/20">
                <Target className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs text-muted-foreground">{t("quiz.completed") || "Completed"}</p>
                <p className="font-bold text-emerald-600">0</p>
              </div>
              <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl p-3 text-center border border-violet-500/20">
                <Zap className="w-5 h-5 mx-auto text-violet-500 mb-1" />
                <p className="text-xs text-muted-foreground">{t("quiz.streak") || "Streak"}</p>
                <p className="font-bold text-violet-600">0</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary border border-primary/20 hover:bg-primary/30 transition-all press-effect"
              >
                <BookOpen className="w-4 h-4" />
                {t("dashboard") || "Dashboard"}
              </button>
              <button 
                onClick={() => navigate("/videos")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent/20 to-fuchsia-500/20 text-accent border border-accent/20 hover:bg-accent/30 transition-all press-effect"
              >
                <Zap className="w-4 h-4" />
                {t("videos") || "Videos"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz List */}
        <Card className="glass-vibrant overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-fuchsia-500 to-violet-500" />
          <CardContent className="pt-6 relative z-10">
            <StudentQuizList user={user} />
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Quizzes;
