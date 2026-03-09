import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNavigation from "@/components/BottomNavigation";
import DottedBackground from "@/components/DottedBackground";

const About = () => {
  const { t } = useLanguage();

  return (
    <DottedBackground className="min-h-screen bg-background pb-20 flex items-center justify-center px-4">
      <Card className="glass-colorful border-white/20 text-center max-w-2xl w-full">
        <CardHeader>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">{t("landing.about.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-xl max-w-xl mx-auto">
            {t("landing.about.desc")}
          </p>
        </CardContent>
      </Card>
      <BottomNavigation />
    </DottedBackground>
  );
};

export default About;
