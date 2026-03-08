import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { GRADES } from "@/constants/grades";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Clock } from "lucide-react";

interface Question {
  question_text: string;
  question_type: "multiple_choice" | "text";
  options: string[];
  correct_answer: string;
  points: number;
}

interface CreateQuizFormProps {
  user: User;
  onQuizCreated: () => void;
}

const CreateQuizForm = ({ user, onQuizCreated }: CreateQuizFormProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | "">("");
  const [grade, setGrade] = useState<string>("");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { question_text: "", question_type: "multiple_choice", options: ["", "", "", ""], correct_answer: "", points: 1 },
  ]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { question_text: "", question_type: "multiple_choice", options: ["", "", "", ""], correct_answer: "", points: 1 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: t("error"), description: t("quiz.titleRequired"), variant: "destructive" });
      return;
    }

    const validQuestions = questions.filter(q => q.question_text.trim() && q.correct_answer.trim());
    if (validQuestions.length === 0) {
      toast({ title: t("error"), description: t("quiz.needQuestions"), variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: quiz, error: quizErr } = await supabase
        .from("quizzes")
        .insert({
          teacher_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          time_limit_minutes: timeLimitMinutes || null,
          grade: grade || null,
          is_published: isPublished,
        } as any)
        .select()
        .single();

      if (quizErr) throw quizErr;

      const questionsToInsert = validQuestions.map((q, i) => ({
        quiz_id: quiz.id,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.question_type === "multiple_choice" ? q.options.filter(o => o.trim()) : null,
        correct_answer: q.correct_answer.trim(),
        points: q.points,
        order_index: i,
      }));

      const { error: qErr } = await supabase.from("quiz_questions").insert(questionsToInsert);
      if (qErr) throw qErr;

      toast({ title: t("success"), description: t("quiz.created") });
      setTitle("");
      setDescription("");
      setTimeLimitMinutes("");
      setIsPublished(false);
      setQuestions([{ question_text: "", question_type: "multiple_choice", options: ["", "", "", ""], correct_answer: "", points: 1 }]);
      onQuizCreated();
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("quiz.create")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>{t("quiz.title")}</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("quiz.titlePlaceholder")} />
        </div>

        <div className="space-y-2">
          <Label>{t("quiz.description")}</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t("quiz.descriptionPlaceholder")} />
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Clock className="h-4 w-4" />{t("quiz.timeLimit")}</Label>
            <Input
              type="number"
              min={1}
              value={timeLimitMinutes}
              onChange={e => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : "")}
              placeholder={t("quiz.timeLimitPlaceholder")}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label>{t("quiz.publish")}</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{t("quiz.questions")}</h3>
          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="border-border">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">{t("quiz.question")} {qIndex + 1}</Label>
                  {questions.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <Input
                  value={q.question_text}
                  onChange={e => updateQuestion(qIndex, "question_text", e.target.value)}
                  placeholder={t("quiz.questionPlaceholder")}
                />

                <div className="flex gap-2 items-center">
                  <Label className="text-sm">{t("quiz.type")}:</Label>
                  <Button
                    variant={q.question_type === "multiple_choice" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateQuestion(qIndex, "question_type", "multiple_choice")}
                  >
                    {t("quiz.multipleChoice")}
                  </Button>
                  <Button
                    variant={q.question_type === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateQuestion(qIndex, "question_type", "text")}
                  >
                    {t("quiz.textAnswer")}
                  </Button>
                </div>

                {q.question_type === "multiple_choice" && (
                  <div className="space-y-2">
                    <Label className="text-sm">{t("quiz.options")}</Label>
                    {q.options.map((opt, oIndex) => (
                      <Input
                        key={oIndex}
                        value={opt}
                        onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`${t("quiz.option")} ${oIndex + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm">{t("quiz.correctAnswer")}</Label>
                  <Input
                    value={q.correct_answer}
                    onChange={e => updateQuestion(qIndex, "correct_answer", e.target.value)}
                    placeholder={t("quiz.correctAnswerPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">{t("quiz.points")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={q.points}
                    onChange={e => updateQuestion(qIndex, "points", parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addQuestion} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> {t("quiz.addQuestion")}
          </Button>
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" /> {saving ? t("loading") : t("quiz.save")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateQuizForm;
