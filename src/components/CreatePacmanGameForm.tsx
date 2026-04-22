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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Save, Ghost } from "lucide-react";

interface PacmanQuestion {
  question_text: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  correct_answer: "a" | "b" | "c" | "d";
}

interface Props {
  user: User;
  onCreated: () => void;
}

const blank = (): PacmanQuestion => ({
  question_text: "",
  answer_a: "",
  answer_b: "",
  answer_c: "",
  answer_d: "",
  correct_answer: "a",
});

const CreatePacmanGameForm = ({ user, onCreated }: Props) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<PacmanQuestion[]>([blank()]);
  const [saving, setSaving] = useState(false);

  const updateQ = (i: number, field: keyof PacmanQuestion, value: string) => {
    const updated = [...questions];
    (updated[i] as any)[field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    const valid = questions.filter(
      (q) => q.question_text.trim() && q.answer_a.trim() && q.answer_b.trim() && q.answer_c.trim() && q.answer_d.trim()
    );
    if (valid.length === 0) {
      toast({ title: "Error", description: "Add at least one complete question", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: game, error: gErr } = await supabase
        .from("pacman_games")
        .insert({
          teacher_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          grade: (grade || null) as any,
          is_published: isPublished,
        })
        .select()
        .single();
      if (gErr) throw gErr;

      const rows = valid.map((q, i) => ({
        game_id: game.id,
        question_text: q.question_text.trim(),
        answer_a: q.answer_a.trim(),
        answer_b: q.answer_b.trim(),
        answer_c: q.answer_c.trim(),
        answer_d: q.answer_d.trim(),
        correct_answer: q.correct_answer,
        order_index: i,
      }));

      const { error: qErr } = await supabase.from("pacman_questions").insert(rows);
      if (qErr) throw qErr;

      toast({ title: "Success", description: "Pacman game created" });
      setTitle("");
      setDescription("");
      setGrade("");
      setIsPublished(false);
      setQuestions([blank()]);
      onCreated();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ghost className="h-5 w-5 text-primary" />
          Create Pacman Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Pacman Game" />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        </div>

        <div className="space-y-2">
          <Label>{t("grade.label") || "Grade"}</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger>
              <SelectValue placeholder={t("grade.select") || "Select grade"} />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {language === "ar" ? g.labelAr : g.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <Label>Publish game</Label>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Questions</h3>
          {questions.map((q, qi) => (
            <Card key={qi} className="border-border">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Question {qi + 1}</Label>
                  {questions.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <Input
                  value={q.question_text}
                  onChange={(e) => updateQ(qi, "question_text", e.target.value)}
                  placeholder="Question text"
                />

                <RadioGroup
                  value={q.correct_answer}
                  onValueChange={(v) => updateQ(qi, "correct_answer", v as any)}
                  className="space-y-2"
                >
                  {(["a", "b", "c", "d"] as const).map((letter) => (
                    <div key={letter} className="flex items-center gap-2">
                      <RadioGroupItem value={letter} id={`q${qi}-${letter}`} />
                      <Label htmlFor={`q${qi}-${letter}`} className="w-6 font-bold uppercase">
                        {letter}
                      </Label>
                      <Input
                        value={q[`answer_${letter}` as keyof PacmanQuestion] as string}
                        onChange={(e) => updateQ(qi, `answer_${letter}` as keyof PacmanQuestion, e.target.value)}
                        placeholder={`Answer ${letter.toUpperCase()}`}
                      />
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Selected radio = correct answer ({q.correct_answer.toUpperCase()})
                </p>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={() => setQuestions([...questions, blank()])} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Game"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreatePacmanGameForm;
