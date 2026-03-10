import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, CheckCircle, Play, Trophy, Star, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentQuizListProps {
  user: User;
}

const StudentQuizList = ({ user }: StudentQuizListProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (quizzesData) {
        setQuizzes(quizzesData);
        const { data: attemptsData } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("student_id", user.id);

        if (attemptsData) {
          const map: Record<string, any> = {};
          for (const a of attemptsData) {
            if (!map[a.quiz_id] || new Date(a.created_at) > new Date(map[a.quiz_id].created_at)) {
              map[a.quiz_id] = a;
            }
          }
          setAttempts(map);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user.id]);

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-violet-500 animate-spin flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white" />
      </div>
    </div>
  );
  
  if (quizzes.length === 0) return (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-secondary flex items-center justify-center mx-auto mb-4">
        <ClipboardList className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-lg">{t("quiz.noQuizzesAvailable")}</p>
      <Button 
        variant="outline" 
        className="mt-4 rounded-xl border-primary/30 hover:bg-primary/10"
        onClick={() => navigate("/videos")}
      >
        <Play className="w-4 h-4 mr-2" />
        {t("videos") || "Watch Videos"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {quizzes.map((quiz, index) => {
        const attempt = attempts[quiz.id];
        const isGraded = attempt?.status === "graded";
        const isInProgress = attempt?.status === "in_progress";
        const scorePercent = isGraded && attempt.max_score > 0 
          ? Math.round((attempt.score / attempt.max_score) * 100) 
          : 0;

        return (
          <Card 
            key={quiz.id} 
            className={`overflow-hidden card-hover group ${
              isGraded 
                ? scorePercent >= 70 
                  ? "border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5" 
                  : "border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5"
                : "glass"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg gradient-text">{quiz.title}</h4>
                    {isGraded && (
                      scorePercent >= 70 ? (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 border-0 text-white">
                          <Trophy className="w-3 h-3 mr-1" />
                          {scorePercent}%
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                          <Star className="w-3 h-3 mr-1" />
                          {scorePercent}%
                        </Badge>
                      )
                    )}
                  </div>
                  
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {quiz.time_limit_minutes && (
                      <Badge variant="outline" className="flex items-center gap-1 border-primary/30 text-primary">
                        <Clock className="h-3 w-3" /> 
                        {quiz.time_limit_minutes} {t("quiz.minutes") || "min"}
                      </Badge>
                    )}
                    {isGraded && (
                      <Badge className="flex items-center gap-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-600 border-violet-500/30">
                        <CheckCircle className="h-3 w-3" /> 
                        {attempt.score}/{attempt.max_score}
                      </Badge>
                    )}
                    {!isGraded && !isInProgress && (
                      <Badge className="flex items-center gap-1 bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary border-primary/30">
                        <Sparkles className="h-3 w-3 animate-pulse" /> 
                        {t("quiz.new") || "New"}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {isGraded ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/quiz-result/${attempt.id}`)}
                      className="rounded-xl border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-600 press-effect"
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      {t("quiz.viewResults") || "Results"}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="rounded-xl bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 border-0 press-effect"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {isInProgress ? t("quiz.continue") : t("quiz.start")}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

import { ClipboardList } from "lucide-react";

export default StudentQuizList;
