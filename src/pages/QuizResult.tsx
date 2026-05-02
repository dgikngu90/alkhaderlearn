import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, CheckCircle, XCircle, Trophy } from "lucide-react";

const QuizResult = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: attemptData } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();

      if (!attemptData) { navigate("/dashboard"); return; }
      setAttempt(attemptData);

      const { data: questionsData } = await supabase
        .rpc("get_quiz_questions_for_review", { p_attempt_id: attemptId });

      setQuestions(questionsData || []);
      setLoading(false);
    };
    fetch();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const answers = (attempt?.answers as Record<string, string>) || {};
  const percentage = attempt?.max_score ? Math.round((attempt.score / attempt.max_score) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">{t("quiz.results")}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {/* Score Card */}
        <Card className="text-center">
          <CardContent className="pt-6 space-y-3">
            <Trophy className={`h-12 w-12 mx-auto ${percentage >= 70 ? "text-yellow-500" : "text-muted-foreground"}`} />
            <h2 className="text-3xl font-bold">{attempt?.score}/{attempt?.max_score}</h2>
            <p className="text-lg text-muted-foreground">{percentage}%</p>
            {percentage >= 70 ? (
              <p className="text-primary font-medium">{t("quiz.passed")}</p>
            ) : (
              <p className="text-destructive font-medium">{t("quiz.needsImprovement")}</p>
            )}
          </CardContent>
        </Card>

        {/* AI Feedback */}
        {attempt?.ai_feedback && (
          <Card>
            <CardHeader><CardTitle className="text-base">{t("quiz.aiFeedback")}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{attempt.ai_feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Questions Review */}
        {questions.map((q, i) => {
          const studentAnswer = answers[q.id] || "";
          const isCorrect = studentAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
          return (
            <Card key={q.id} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-destructive"}`}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{i + 1}. {q.question_text}</p>
                    <p className="text-sm mt-1">
                      <span className="text-muted-foreground">{t("quiz.yourAnswer")}: </span>
                      <span className={isCorrect ? "text-green-600" : "text-destructive"}>
                        {studentAnswer || `(${t("quiz.noAnswer")})`}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">{t("quiz.correctAnswer")}: </span>
                        <span className="text-green-600 font-medium">{q.correct_answer}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
          {t("back")}
        </Button>
      </main>
    </div>
  );
};

export default QuizResult;
