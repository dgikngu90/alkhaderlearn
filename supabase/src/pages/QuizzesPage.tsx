import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StudentQuizList from "@/components/StudentQuizList";
import BottomNavigation from "@/components/BottomNavigation";
import DottedBackground from "@/components/DottedBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import { ClipboardList } from "lucide-react";

const QuizzesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DottedBackground className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">{t("quiz.available")}</h1>
          <p className="text-sm text-muted-foreground">{t("quiz.availableDesc")}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {user ? (
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
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
        ) : (
          <Card className="glass border-border/50 text-center p-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">{t("auth.signInRequired") || "Please sign in to access quizzes"}</p>
              <Button onClick={() => navigate("/auth")}>{t("get.started")}</Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </DottedBackground>
  );
};

export default QuizzesPage;
