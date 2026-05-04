import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNavigation from "@/components/BottomNavigation";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  youtube_video_id: string | null;
  notes: string | null;
}

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!lessonId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data, error } = await supabase
        .from("lessons")
        .select("*, modules!inner(teacher_id)")
        .eq("id", lessonId)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Error", description: "Lesson not found", variant: "destructive" });
        navigate(-1);
        return;
      }
      const l = data as any;
      setLesson(l);
      setNotes(l.notes || "");
      setIsOwner(l.modules?.teacher_id === user.id);
      setLoading(false);
    };
    load();
  }, [lessonId]);

  const saveNotes = async () => {
    if (!lesson) return;
    setSaving(true);
    const { error } = await supabase
      .from("lessons")
      .update({ notes })
      .eq("id", lesson.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: language === "ar" ? "تم الحفظ" : "Saved" });
    }
  };

  if (loading || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(`/curriculum/${lesson.module_id}`)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>

        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

        {lesson.youtube_video_id ? (
          <div className="relative w-full mb-6 rounded-xl overflow-hidden shadow-xl" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${lesson.youtube_video_id}?rel=0`}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="py-12 text-center text-muted-foreground">
              {language === "ar" ? "لا يوجد فيديو" : "No video for this lesson"}
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {language === "ar" ? "الملاحظات" : "Notes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isOwner ? (
              <>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={10}
                  placeholder={language === "ar" ? "اكتب ملاحظاتك هنا..." : "Write notes here..."}
                />
                <Button onClick={saveNotes} disabled={saving} className="mt-4">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {language === "ar" ? "حفظ" : "Save"}
                </Button>
              </>
            ) : notes ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{notes}</div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {language === "ar" ? "لا توجد ملاحظات" : "No notes available"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default LessonPage;
