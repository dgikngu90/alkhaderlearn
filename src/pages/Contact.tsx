import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNavigation from "@/components/BottomNavigation";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20 flex items-center justify-center px-4">
      <Card className="glass border-border/50 text-center max-w-md w-full">
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
            <Phone className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="text-lg">{t("landing.contact.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{t("landing.contact.desc")}</p>
          <a href="tel:0788212294" className="text-xl font-bold gradient-text underline-animate">
            0788212294
          </a>
        </CardContent>
      </Card>
      <BottomNavigation />
    </div>
  );
};

export default Contact;
