import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Send, ArrowLeft } from "lucide-react";

const TakeQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmitRef = useRef(false);

  const submitQuiz = useCallback(async (currentAnswers: Record<string, string>, currentAttemptId: string | null) => {
    if (!currentAttemptId || autoSubmitRef.current) return;
    autoSubmitRef.current = true;
    setSubmitting(true);

    try {
      // Save answers first
      const { error: saveErr } = await supabase
        .from("quiz_attempts")
        .update({ answers: currentAnswers, submitted_at: new Date().toISOString() })
        .eq("id", currentAttemptId);

      if (saveErr) {
        console.error("Failed to save answers:", saveErr);
      }

      // Call AI grading (also passes answers as backup)
      const { data, error } = await supabase.functions.invoke("grade-quiz", {
        body: { attempt_id: currentAttemptId, answers: currentAnswers },
      });

      if (error) throw error;

      toast({ title: t("success"), description: t("quiz.submitted") });
      navigate(`/quiz-result/${currentAttemptId}`, { replace: true });
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
      autoSubmitRef.current = false;
      setSubmitting(false);
    }
  }, [navigate, t, toast]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (!quizData) { navigate("/dashboard"); return; }
      setQuiz(quizData);

      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index");

      setQuestions(questionsData || []);

      // Check existing in-progress attempt (get latest one)
      const { data: existingList } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("student_id", user.id)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1);

      const existing = existingList?.[0] || null;

      if (existing) {
        setAttemptId(existing.id);
        setAnswers((existing.answers as Record<string, string>) || {});
        // Calculate remaining time
        if (quizData.time_limit_minutes) {
          const elapsed = (Date.now() - new Date(existing.started_at).getTime()) / 1000;
          const remaining = quizData.time_limit_minutes * 60 - elapsed;
          setTimeLeft(Math.max(0, Math.floor(remaining)));
        }
      } else {
        // Check if already graded (get latest)
        const { data: gradedList } = await supabase
          .from("quiz_attempts")
          .select("id")
          .eq("quiz_id", quizId)
          .eq("student_id", user.id)
          .eq("status", "graded")
          .order("created_at", { ascending: false })
          .limit(1);

        const graded = gradedList?.[0] || null;

        if (graded) {
          navigate(`/quiz-result/${graded.id}`, { replace: true });
          return;
        }

        // Create new attempt
        const { data: newAttempt, error } = await supabase
          .from("quiz_attempts")
          .insert({ quiz_id: quizId, student_id: user.id })
          .select()
          .single();

        if (error) {
          toast({ title: t("error"), description: error.message, variant: "destructive" });
          navigate("/dashboard");
          return;
        }
        setAttemptId(newAttempt.id);
        if (quizData.time_limit_minutes) {
          setTimeLeft(quizData.time_limit_minutes * 60);
        }
      }
      setLoading(false);
    };
    init();
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && attemptId && !autoSubmitRef.current) {
        submitQuiz(answers, attemptId);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft !== null, attemptId]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && attemptId && !autoSubmitRef.current) {
      toast({ title: t("quiz.timeUp"), description: t("quiz.autoSubmit") });
      submitQuiz(answers, attemptId);
    }
  }, [timeLeft, attemptId, answers, submitQuiz, t, toast]);

  const setAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground truncate">{quiz?.title}</h1>
          </div>
          {timeLeft !== null && (
            <Badge timeLeft={timeLeft} formatTime={formatTime} />
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {questions.map((q, i) => (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {i + 1}. {q.question_text}
                <span className="text-sm text-muted-foreground ml-2">({q.points} {t("quiz.pts")})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {q.question_type === "multiple_choice" && q.options ? (
                <RadioGroup value={answers[q.id] || ""} onValueChange={v => setAnswer(q.id, v)}>
                  {(q.options as string[]).map((opt: string, oi: number) => (
                    <div key={oi} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value={opt} id={`${q.id}-${oi}`} />
                      <Label htmlFor={`${q.id}-${oi}`} className="cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  value={answers[q.id] || ""}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  placeholder={t("quiz.typeAnswer")}
                />
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={() => submitQuiz(answers, attemptId)}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting ? t("loading") : t("quiz.submit")}
        </Button>
      </main>
    </div>
  );
};

// Timer badge component
const Badge = ({ timeLeft, formatTime }: { timeLeft: number; formatTime: (s: number) => string }) => {
  const isUrgent = timeLeft < 60;
  return (
    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono font-bold ${
      isUrgent ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary/10 text-primary"
    }`}>
      <Clock className="h-4 w-4" />
      {formatTime(timeLeft)}
    </div>
  );
};

export default TakeQuiz;
