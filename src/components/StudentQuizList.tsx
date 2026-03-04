import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, CheckCircle, Play } from "lucide-react";
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
            // Keep the latest attempt per quiz
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

  if (loading) return <p className="text-muted-foreground">{t("loading")}</p>;
  if (quizzes.length === 0) return <p className="text-muted-foreground">{t("quiz.noQuizzesAvailable")}</p>;

  return (
    <div className="space-y-3">
      {quizzes.map(quiz => {
        const attempt = attempts[quiz.id];
        const isGraded = attempt?.status === "graded";
        const isInProgress = attempt?.status === "in_progress";

        return (
          <Card key={quiz.id} className="border-border">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold">{quiz.title}</h4>
                  {quiz.description && <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quiz.time_limit_minutes && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {quiz.time_limit_minutes} {t("quiz.minutes")}
                      </Badge>
                    )}
                    {isGraded && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> {attempt.score}/{attempt.max_score}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  {isGraded ? (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/quiz-result/${attempt.id}`)}>
                      {t("quiz.viewResults")}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => navigate(`/quiz/${quiz.id}`)}>
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

export default StudentQuizList;
