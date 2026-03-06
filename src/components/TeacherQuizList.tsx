import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trash2, Eye, EyeOff, Clock, Users, BarChart3 } from "lucide-react";
import TeacherQuizResults from "./TeacherQuizResults";

interface TeacherQuizListProps {
  user: User;
  refreshKey: number;
}

const TeacherQuizList = ({ user, refreshKey }: TeacherQuizListProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [viewingQuiz, setViewingQuiz] = useState<{ id: string; title: string } | null>(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setQuizzes(data);
      // Fetch attempt counts
      const counts: Record<string, number> = {};
      for (const quiz of data) {
        const { count } = await supabase
          .from("quiz_attempts")
          .select("*", { count: "exact", head: true })
          .eq("quiz_id", quiz.id)
          .eq("status", "graded");
        counts[quiz.id] = count || 0;
      }
      setAttemptCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchQuizzes(); }, [refreshKey]);

  const togglePublish = async (quizId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("quizzes")
      .update({ is_published: !currentStatus })
      .eq("id", quizId);

    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("success"), description: !currentStatus ? t("quiz.published") : t("quiz.unpublished") });
      fetchQuizzes();
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm(t("quiz.deleteConfirm"))) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("success"), description: t("quiz.deleted") });
      fetchQuizzes();
    }
  };

  if (loading) return <p className="text-muted-foreground">{t("loading")}</p>;
  if (quizzes.length === 0 && !viewingQuiz) return <p className="text-muted-foreground">{t("quiz.noQuizzes")}</p>;

  if (viewingQuiz) {
    return <TeacherQuizResults quizId={viewingQuiz.id} quizTitle={viewingQuiz.title} onBack={() => setViewingQuiz(null)} />;
  }

  return (
    <div className="space-y-3">
      {quizzes.map(quiz => (
        <Card key={quiz.id} className="border-border">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h4 className="font-semibold">{quiz.title}</h4>
                {quiz.description && <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={quiz.is_published ? "default" : "secondary"}>
                    {quiz.is_published ? t("quiz.published") : t("quiz.draft")}
                  </Badge>
                  {quiz.time_limit_minutes && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {quiz.time_limit_minutes} {t("quiz.minutes")}
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {attemptCounts[quiz.id] || 0} {t("quiz.submissions")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewingQuiz({ id: quiz.id, title: quiz.title })} title={t("quiz.viewStudentResults")}>
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => togglePublish(quiz.id, quiz.is_published)}>
                  {quiz.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteQuiz(quiz.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeacherQuizList;
