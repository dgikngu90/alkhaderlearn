import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, CheckCircle, XCircle, User, Clock } from "lucide-react";

interface TeacherQuizResultsProps {
  quizId: string;
  quizTitle: string;
  onBack: () => void;
}

const TeacherQuizResults = ({ quizId, quizTitle, onBack }: TeacherQuizResultsProps) => {
  const { t } = useLanguage();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [attRes, qRes] = await Promise.all([
        supabase
          .from("quiz_attempts")
          .select("*")
          .eq("quiz_id", quizId)
          .eq("status", "graded")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizId)
          .order("order_index"),
      ]);

      const attData = attRes.data || [];
      setAttempts(attData);
      setQuestions(qRes.data || []);

      // Fetch student profiles
      const studentIds = [...new Set(attData.map(a => a.student_id))];
      if (studentIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);

        const map: Record<string, string> = {};
        profilesData?.forEach(p => { map[p.id] = p.full_name || t("unknown"); });
        setProfiles(map);
      }

      setLoading(false);
    };
    fetchData();
  }, [quizId]);

  if (loading) return <p className="text-muted-foreground">{t("loading")}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-lg">{quizTitle} — {t("quiz.studentResults")}</h3>
      </div>

      {attempts.length === 0 ? (
        <p className="text-muted-foreground">{t("quiz.noSubmissions")}</p>
      ) : (
        attempts.map(attempt => {
          const answers = (attempt.answers as Record<string, string>) || {};
          const percentage = attempt.max_score ? Math.round((attempt.score / attempt.max_score) * 100) : 0;
          const isExpanded = expandedAttempt === attempt.id;

          return (
            <Card key={attempt.id} className="border-border">
              <CardContent className="pt-4">
                <button
                  onClick={() => setExpandedAttempt(isExpanded ? null : attempt.id)}
                  className="w-full text-start"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profiles[attempt.student_id] || t("unknown")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                        {attempt.score}/{attempt.max_score} ({percentage}%)
                      </Badge>
                      {attempt.submitted_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(attempt.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t pt-3">
                    {questions.map((q, i) => {
                      const studentAnswer = answers[q.id] || "";
                      const isCorrect = studentAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                      return (
                        <div key={q.id} className={`p-3 rounded-lg border-s-4 ${isCorrect ? "border-s-green-500 bg-green-500/5" : "border-s-destructive bg-destructive/5"}`}>
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            )}
                            <div className="text-sm space-y-1">
                              <p className="font-medium">{i + 1}. {q.question_text}</p>
                              <p>
                                <span className="text-muted-foreground">{t("quiz.yourAnswer")}: </span>
                                <span className={isCorrect ? "text-green-600" : "text-destructive"}>
                                  {studentAnswer || `(${t("quiz.noAnswer")})`}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p>
                                  <span className="text-muted-foreground">{t("quiz.correctAnswer")}: </span>
                                  <span className="text-green-600 font-medium">{q.correct_answer}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {attempt.ai_feedback && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium mb-1">{t("quiz.aiFeedback")}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{attempt.ai_feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default TeacherQuizResults;
