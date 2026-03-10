import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Video, Crown, Eye, Settings, BookOpen, Phone, Download, ArrowRight, Sparkles, Star, Zap, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-orbs animate-pulse" />
      
      {/* Floating Shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-20 rounded-full blur-2xl animate-float-reverse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-violet-20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Stars */}
        <div className="absolute top-40 right-20">
          <Star className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>
        <div className="absolute bottom-40 left-20">
          <Star className="w-3 h-3 text-fuchsia-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Alkhader Learn" className="h-10 w-auto" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/settings")} variant="ghost" size="icon" className="hover:bg-primary/10">
              <Settings className="h-5 w-5" />
            </Button>
            <Button onClick={() => navigate("/auth")} className="rounded-full press-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0">
              {t("get.started")}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-24">
        {/* Hero Section */}
        <section className="text-center py-16 stagger-children">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 via-accent/10 to-cyan-10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-sm font-medium gradient-text">{t("landing.hero.title")}</span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 gradient-text-rainbow leading-tight drop-shadow-lg">
            {t("landing.hero.title")}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="text-base px-8 py-6 rounded-full glow-multi press-effect animate-bounce-in bg-gradient-to-r from-primary via-violet-500 to-accent border-0"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              {t("landing.hero.cta")}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="text-base px-8 py-6 rounded-full press-effect border-2 border-accent/30 hover:border-accent hover:bg-accent/10"
            >
              <a href="https://median.co/share/eeekywy#apk" target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-5 w-5" />
                Download App
              </a>
            </Button>
          </div>
        </section>

        {/* Features Section - Colorful Cards */}
        <section className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="glass card-hover text-center group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Video className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">{t("landing.feature.quality.title")}</CardTitle>
              <CardDescription className="text-base">{t("landing.feature.quality.desc")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass card-hover text-center group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Eye className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">{t("landing.feature.free.title")}</CardTitle>
              <CardDescription className="text-base">{t("landing.feature.free.desc")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass card-hover text-center sm:col-span-1 col-span-2 mx-auto w-full max-w-sm sm:max-w-none group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Crown className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">{t("landing.feature.premium.title")}</CardTitle>
              <CardDescription className="text-base">{t("landing.feature.premium.desc")}</CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Teacher CTA - Vibrant */}
        <section className="max-w-3xl mx-auto">
          <Card className="glass-vibrant gradient-border-vibrant overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <CardContent className="p-8 text-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full px-4 py-2 mb-4">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">انضم إلينا</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 gradient-text">{t("landing.teacher.title")}</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                {t("landing.teacher.desc")}
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth")} 
                className="rounded-full press-effect border-2 border-primary/30 hover:border-primary hover:bg-primary/10 px-8"
              >
                {t("landing.teacher.cta")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* About Section - Colorful */}
        <section className="max-w-3xl mx-auto">
          <Card className="glass-vibrant text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-accent" />
            <CardHeader className="pt-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl gradient-text">{t("landing.about.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t("landing.about.desc")}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Creators Section - Colorful */}
        <section className="max-w-3xl mx-auto">
          <Card className="glass-vibrant">
            <CardHeader className="text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full px-4 py-2 mx-auto mb-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{t("landing.creators")}</span>
              </div>
              <CardTitle className="text-2xl gradient-text-rainbow">{t("landing.creators")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { ar: "سعد", en: "Saad", color: "from-primary to-violet-500" },
                  { ar: "البراء", en: "Braa", color: "from-accent to-fuchsia-500" },
                  { ar: "علي", en: "Ali", color: "from-cyan-500 to-emerald-500" },
                  { ar: "يوسف", en: "Yousef", color: "from-amber-500 to-orange-500" },
                  { ar: "كريم", en: "Kareem", color: "from-violet-500 to-primary" },
                ].map((creator, index) => (
                  <div 
                    key={creator.en} 
                    className={`bg-gradient-to-br ${creator.color} p-4 rounded-2xl text-center card-hover shadow-lg`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <p className="font-bold text-lg text-white">{creator.ar}</p>
                    <p className="text-sm text-white/80">{creator.en}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section - Vibrant */}
        <section className="max-w-md mx-auto pb-8">
          <Card className="glass-vibrant text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-fuchsia-500 to-cyan-500" />
            <CardHeader className="pt-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-fuchsia-500 flex items-center justify-center mx-auto mb-2 shadow-lg animate-pulse">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl gradient-text">{t("landing.contact.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t("landing.contact.desc")}</p>
              <a 
                href="tel:0797732606" 
                className="text-3xl font-bold gradient-text-rainbow underline-animate inline-block"
              >
                0797732606
              </a>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t glass py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Alkhader Learn. Made with <span className="text-fuchsia-500">♥</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
