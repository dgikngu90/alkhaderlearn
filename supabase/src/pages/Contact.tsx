import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNavigation from "@/components/BottomNavigation";
import DottedBackground from "@/components/DottedBackground";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <DottedBackground className="min-h-screen bg-background pb-20 flex items-center justify-center px-4">
      <Card className="glass-colorful border-white/20 text-center max-w-md w-full">
        <CardHeader className="pt-8 pb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("landing.contact.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t("landing.contact.desc")}</p>
          <a href="tel:0797732606" className="text-2xl font-bold gradient-text-rainbow underline-animate inline-block">
            0797732606
          </a>
        </CardContent>
      </Card>
      <BottomNavigation />
    </DottedBackground>
  );
};

export default Contact;
