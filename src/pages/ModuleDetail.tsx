import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Loader2, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNavigation from "@/components/BottomNavigation";

interface Lesson {
  id: string;
  title: string;
  youtube_video_id: string | null;
  notes: string | null;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  teacher_id: string;
}

const extractYoutubeId = (input: string): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1];
  }
  return null;
};

const ModuleDetail = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [ytInput, setYtInput] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!moduleId) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);

    const { data: mod, error: modErr } = await supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .maybeSingle();
    if (modErr || !mod) {
      toast({ title: "Error", description: "Module not found", variant: "destructive" });
      navigate("/curriculum");
      return;
    }
    setModule(mod as Module);

    const { data: les } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true });
    setLessons((les as Lesson[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [moduleId]);

  const isOwner = !!module && module.teacher_id === userId;

  const createLesson = async () => {
    if (!title.trim() || !moduleId) return;
    const ytId = extractYoutubeId(ytInput);
    if (ytInput && !ytId) {
      toast({ title: language === "ar" ? "رابط غير صالح" : "Invalid YouTube link", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("lessons").insert({
      module_id: moduleId,
      title: title.trim(),
      youtube_video_id: ytId,
      notes: notes.trim() || null,
      order_index: lessons.length,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setTitle(""); setYtInput(""); setNotes("");
    setOpen(false);
    load();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm(language === "ar" ? "حذف هذا الدرس؟" : "Delete this lesson?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/curriculum")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{module?.title}</h1>
            {module?.description && (
              <p className="text-muted-foreground mt-1">{module.description}</p>
            )}
          </div>
          {isOwner && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "ar" ? "درس جديد" : "New Lesson"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === "ar" ? "إنشاء درس" : "Create Lesson"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{language === "ar" ? "العنوان" : "Title"}</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>{language === "ar" ? "رابط يوتيوب" : "YouTube link or ID"}</Label>
                    <Input value={ytInput} onChange={(e) => setYtInput(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  <div>
                    <Label>{language === "ar" ? "ملاحظات" : "Notes"}</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createLesson} disabled={saving || !title.trim()}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {language === "ar" ? "حفظ" : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              {language === "ar" ? "لا توجد دروس بعد" : "No lessons yet"}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lessons.map((l, idx) => (
              <Card
                key={l.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 border-primary/10"
                onClick={() => navigate(`/lesson/${l.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {idx + 1}
                      </span>
                      <PlayCircle className="h-5 w-5 text-primary" />
                      {l.title}
                    </CardTitle>
                    {isOwner && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); deleteLesson(l.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default ModuleDetail;
