import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Zap, Star, BookOpen, Phone, Megaphone, Bell } from "lucide-react";
import BottomNavigation from "./BottomNavigation";
import CourseProgress from "./CourseProgress";
import Scoreboard from "./Scoreboard";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudentDashboardProps {
  user: User | null;
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("is_broadcast", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (data) setAnnouncements(data);
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="relative z-10 pb-20">

        {/* Hero Section */}
        <section
          id="hero"
          className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
        >
          {/* Vibrant animated background blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-10 left-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute top-1/3 right-[-10%] w-[400px] h-[400px] bg-pink-500/25 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-orange-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-10 relative stagger-children">
            {announcements.length > 0 && (
              <div className="mb-6 animate-in fade-in zoom-in duration-700">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-5 py-2 text-sm font-medium">
                  <Megaphone className="h-4 w-4 text-purple-500" />
                  <span className="text-purple-600 dark:text-purple-400">{t("broadcast")}</span>
                </div>
                <div className="glass-colorful mt-4 rounded-2xl p-5 max-w-2xl mx-auto flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <Bell className="h-7 w-7 text-purple-500" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-lg">{announcements[0].title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{announcements[0].content}</p>
                  </div>
                </div>
              </div>
            )}

            {user && (
              <div className="w-full max-w-md mx-auto mb-8">
                <CourseProgress userId={user.id} />
              </div>
            )}

            {user && (
              <div className="w-full max-w-md mx-auto mb-8">
                <Scoreboard user={user} />
              </div>
            )}

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold gradient-text-rainbow leading-tight drop-shadow-lg">
                {t("landing.title")}
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t("landing.subtitle")}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 mt-12">
              <Card className="glass-colorful card-hover-colorful border-white/20 glow-sm group">
                <CardHeader className="space-y-5 pb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{t("landing.quality.title")}</CardTitle>
                  <CardDescription className="text-base">{t("landing.quality.desc")}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="glass-colorful card-hover-colorful border-white/20 glow-sm group">
                <CardHeader className="space-y-5 pb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{t("landing.free.title")}</CardTitle>
                  <CardDescription className="text-base">{t("landing.free.desc")}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="glass-colorful card-hover-colorful border-white/20 glow-sm group sm:col-span-1 col-span-2 mx-auto w-full max-w-sm sm:max-w-none">
                <CardHeader className="space-y-5 pb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{t("landing.premium.title")}</CardTitle>
                  <CardDescription className="text-base">{t("landing.premium.desc")}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <div id="about" className="px-4 pb-12 max-w-4xl mx-auto">
          <Card className="glass-colorful border-white/20 text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
            <CardHeader className="pt-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold gradient-text">{t("landing.about.title")}</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                {t("landing.about.desc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div id="contact" className="px-4 pb-16 max-w-md mx-auto">
          <Card className="glass-colorful border-white/20 text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
            <CardHeader className="pt-8 pb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">{t("landing.contact.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t("landing.contact.desc")}</p>
              <a
                href="tel:0797732606"
                className="text-2xl font-bold gradient-text-rainbow underline-animate inline-block"
              >
                0797732606
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default StudentDashboard;
