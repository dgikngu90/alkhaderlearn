import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, CheckCircle, Zap, Star, BookOpen, Phone, Download, ClipboardList, Megaphone, Bell } from "lucide-react";
import VideoList from "./VideoList";
import StudyAssistantChat from "./StudyAssistantChat";
import StudentQuizList from "./StudentQuizList";
import BottomNavigation from "./BottomNavigation";
import CourseProgress from "./CourseProgress";
import Scoreboard from "./Scoreboard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import arabicBg from "@/assets/category-arabic.jpeg";
import biologyBg from "@/assets/category-biology.jpeg";
import englishBg from "@/assets/category-english.jpeg";
import chemistryBg from "@/assets/category-chemistry-new.jpeg";
import mathBg from "@/assets/category-math.jpeg";

interface StudentDashboardProps {
  user: User | null;
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
    { name: "عربي", image: arabicBg },
    { name: "English", image: englishBg },
    { name: "علوم حياتية", image: biologyBg },
    { name: "كيمياء", image: chemistryBg },
    { name: "رياضيات", image: mathBg },
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
      className="min-h-screen bg-background relative"
      style={getCategoryBackground() ? {
        backgroundImage: `url(${getCategoryBackground()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : undefined}
    >
      {getCategoryBackground() && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10" />
      )}

      <div className="relative z-10 pb-20">

        {/* Hero Section */}
        <section
          id="hero"
          className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

          <div className="max-w-4xl mx-auto text-center space-y-8 relative stagger-children">
            {announcements.length > 0 && (
              <div className="mb-8 animate-in fade-in zoom-in duration-1000">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1 mb-4 text-primary text-sm font-medium">
                  <Megaphone className="h-4 w-4" />
                  {t("broadcast")}
                </div>
                <div className="glass border-primary/20 rounded-2xl p-4 max-w-2xl mx-auto flex items-center gap-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Bell className="h-6 w-6 text-primary animate-ring" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-foreground">{announcements[0].title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{announcements[0].content}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => handleScrollTo("assistant")}>
                    {t("video.watch")}
                  </Button>
                </div>
              </div>
            )}

            {user && (
              <div className="w-full max-w-sm mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 delay-200">
                <CourseProgress userId={user.id} />
              </div>
            )}

            {user && (
              <div className="w-full max-w-sm mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                <Scoreboard user={user} />
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold gradient-text leading-tight drop-shadow-sm">
              {t("landing.title")}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.subtitle")}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
              <Card className="glass card-hover glow-sm border-border/50">
                <CardHeader className="space-y-4 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t("landing.quality.title")}</CardTitle>
                  <CardDescription className="text-sm">{t("landing.quality.desc")}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="glass card-hover glow-sm border-border/50">
                <CardHeader className="space-y-4 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                    <Zap className="h-7 w-7 text-accent" />
                  </div>
                  <CardTitle className="text-xl">{t("landing.free.title")}</CardTitle>
                  <CardDescription className="text-sm">{t("landing.free.desc")}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="glass card-hover glow-sm border-border/50 sm:col-span-1 col-span-2 mx-auto w-full max-w-sm sm:max-w-none">
                <CardHeader className="space-y-4 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Star className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t("landing.premium.title")}</CardTitle>
                  <CardDescription className="text-sm">{t("landing.premium.desc")}</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="pt-8 flex flex-col items-center gap-6">
              <Button
                size="lg"
                asChild
                className="px-8 py-6 text-lg rounded-full glow press-effect animate-pulse-glow"
              >
                <a href="https://median.co/share/eeekywy#apk" target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-5 w-5" />
                  Download App
                </a>
              </Button>
              <p className="text-muted-foreground text-sm">
                ↓ {t("student.scroll.down") || "Scroll down to explore"} ↓
              </p>
            </div>
          </div>
        </section>

        {/* Study Assistant */}
        <div id="assistant" className="px-4 pb-8 max-w-4xl mx-auto">
          <StudyAssistantChat />
        </div>

        {/* Quizzes Section */}
        {user && (
          <div id="quizzes" className="px-4 pb-8 max-w-4xl mx-auto">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  {t("quiz.available")}
                </CardTitle>
                <CardDescription>{t("quiz.availableDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentQuizList user={user} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Videos Section */}
        <div id="videos" className="px-4 pb-8 max-w-6xl mx-auto">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Video className="h-5 w-5 text-primary" />
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
                    className={`relative h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 press-effect ${selectedCategory === "all"
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-glow scale-105"
                      : "hover:scale-102"
                      }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm sm:text-base">{t("student.all.categories")}</span>
                    </div>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`relative h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 press-effect ${selectedCategory === cat.name
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-glow scale-105"
                        : "hover:scale-102"
                        }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
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

        {/* About Section */}
        <div id="about" className="px-4 pb-8 max-w-4xl mx-auto">
          <Card className="glass border-border/50 text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t("landing.about.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t("landing.about.desc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div id="contact" className="px-4 pb-12 max-w-md mx-auto">
          <Card className="glass border-border/50 text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg">{t("landing.contact.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{t("landing.contact.desc")}</p>
              <a
                href="tel:0788212294"
                className="text-xl font-bold gradient-text underline-animate"
              >
                0788212294
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
