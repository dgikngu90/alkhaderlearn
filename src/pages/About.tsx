import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNavigation from "@/components/BottomNavigation";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20 flex items-center justify-center px-4">
      <Card className="glass border-border/50 text-center max-w-2xl w-full">
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
      <BottomNavigation />
    </div>
  );
};

export default About;
