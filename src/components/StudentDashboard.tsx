import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, CheckCircle, Zap, Star, BookOpen, Phone, Download, ClipboardList, Megaphone, Bell, Sparkles } from "lucide-react";
import VideoList from "./VideoList";
import StudyAssistantChat from "./StudyAssistantChat";
import StudentQuizList from "./StudentQuizList";
import BottomNavigation from "./BottomNavigation";
import CourseProgress from "./CourseProgress";
import Scoreboard from "./Scoreboard";
import { useLanguage } from "@/contexts/LanguageContext";
import { GRADES } from "@/constants/grades";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import arabicBg from "@/assets/category-arabic.jpeg";
import biologyBg from "@/assets/category-biology.jpeg";
import englishBg from "@/assets/category-english.jpeg";
import chemistryBg from "@/assets/category-chemistry-new.jpeg";
import mathBg from "@/assets/category-math.jpeg";
import financeBg from "@/assets/category-finance.jpeg";

interface StudentDashboardProps {
  user: User | null;
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
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

  const categories = [
    { name: "عربي", image: arabicBg, color: "from-primary to-violet-500" },
    { name: "English", image: englishBg, color: "from-accent to-fuchsia-500" },
    { name: "علوم حياتية", image: biologyBg, color: "from-emerald-500 to-cyan-500" },
    { name: "كيمياء", image: chemistryBg, color: "from-amber-500 to-orange-500" },
    { name: "رياضيات", image: mathBg, color: "from-cyan-500 to-blue-500" },
    { name: "مالية", image: financeBg, color: "from-violet-500 to-primary" },
  ];

  const getCategoryBackground = () => {
    if (selectedCategory === "all") return "";
    const category = categories.find(cat => cat.name === selectedCategory);
    return category?.image || "";
  };

  const handleScrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-orbs" />
      
      {/* Floating Shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan/20 rounded-full blur-2xl animate-float-reverse" />
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-violet-20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {getCategoryBackground() && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10" />
      )}

      <div className="relative z-10 pb-20">

        {/* Hero Section */}
        <section
          id="hero"
          className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
        >
          {/* Colorful Blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/30 to-violet-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/30 to-fuchsia-500/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-cyan/20 rounded-full blur-3xl animate-float-reverse" />

          <div className="max-w-4xl mx-auto text-center space-y-8 relative stagger-children">
            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="mb-8 animate-in fade-in zoom-in duration-1000">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 via-violet-500/20 to-accent/20 border border-primary/20 rounded-full px-4 py-1 mb-4">
                  <Megaphone className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium gradient-text">{t("broadcast")}</span>
                </div>
                <div className="glass-vibrant border-primary/20 rounded-2xl p-4 max-w-2xl mx-auto flex items-center gap-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-violet-500/5 to-accent/5 group-hover:opacity-100 opacity-0 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shrink-0">
                    <Bell className="h-6 w-6 text-white animate-ring" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-foreground">{announcements[0].title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{announcements[0].content}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-primary/10" onClick={() => handleScrollTo("about")}>
                    {t("video.watch")}
                  </Button>
                </div>
              </div>
            )}

            {/* Course Progress */}
            {user && (
              <div className="w-full max-w-sm mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 delay-200">
                <CourseProgress userId={user.id} />
              </div>
            )}

            {/* Scoreboard */}
            {user && (
              <div className="w-full max-w-sm mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                <Scoreboard user={user} />
              </div>
            )}

            {/* Title with Gradient */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold gradient-text-rainbow leading-tight drop-shadow-lg animate-bounce-in">
              {t("landing.title")}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.subtitle")}
            </p>

            {/* Feature Cards - Colorful */}
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
              <Card className="glass card-hover glow-sm border-border/50 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="space-y-4 pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl gradient-text">{t("landing.quality.title")}</CardTitle>
                  <CardDescription className="text-sm">{t("landing.quality.desc")}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="glass card-hover glow-sm border-border/50 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="space-y-4 pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-fuchsia-500 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl gradient-text">{t("landing.free.title")}</CardTitle>
                  <CardDescription className="text-sm">{t("landing.free.desc")}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="glass card-hover glow-sm border-border/50 sm:col-span-1 col-span-2 mx-auto w-full max-w-sm sm:max-w-none group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="space-y-4 pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl gradient-text">{t("landing.premium.title")}</CardTitle>
                  <CardDescription className="text-sm">{t("landing.premium.desc")}</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Download Button - Vibrant */}
            <div className="pt-8 flex flex-col items-center gap-6">
              <Button
                size="lg"
                asChild
                className="px-8 py-6 text-lg rounded-full glow-multi press-effect animate-bounce-in bg-gradient-to-r from-primary via-violet-500 to-accent border-0"
              >
                <a href="https://median.co/share/eeekywy#apk" target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-5 w-5" />
                  Download App
                  <Sparkles className="ml-2 h-4 w-4 text-amber-300" />
                </a>
              </Button>
              <p className="text-muted-foreground text-sm animate-pulse">
                ↓ {t("student.scroll.down") || "Scroll down to explore"} ↓
              </p>
            </div>
          </div>
        </section>

        {/* About Section - Colorful */}
        <div id="about" className="px-4 pb-8 max-w-4xl mx-auto">
          <Card className="glass-vibrant text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-accent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pt-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl gradient-text-rainbow">{t("landing.about.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t("landing.about.desc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section - Vibrant */}
        <div id="contact" className="px-4 pb-12 max-w-md mx-auto">
          <Card className="glass-vibrant text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-fuchsia-500 to-cyan-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pt-8 pb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-fuchsia-500 flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg gradient-text">{t("landing.contact.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{t("landing.contact.desc")}</p>
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
