import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, Plus, Trash2, Loader2, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNavigation from "@/components/BottomNavigation";
import { GRADES } from "@/constants/grades";

interface Module {
  id: string;
  title: string;
  description: string | null;
  grade: string | null;
  order_index: number;
  teacher_id: string;
  is_published: boolean;
}

const Curriculum = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userGrade, setUserGrade] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const selectedGrade = searchParams.get("grade");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);

    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("profiles").select("grade").eq("id", user.id).maybeSingle(),
    ]);
    const teacher = !!roles?.some((r) => r.role === "teacher" || r.role === "admin");
    setIsTeacher(teacher);
    setUserGrade((profile as any)?.grade ?? null);

    // Auto-select student's own grade if not chosen yet
    if (!teacher && !selectedGrade && (profile as any)?.grade) {
      setSearchParams({ grade: (profile as any).grade }, { replace: true });
    }

    let q = supabase
      .from("modules")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });
    if (selectedGrade) q = q.eq("grade", selectedGrade as any);

    const { data, error } = await q;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setModules((data as Module[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  const createModule = async () => {
    if (!title.trim() || !userId) return;
    setSaving(true);
    const { error } = await supabase.from("modules").insert({
      teacher_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      grade: (grade || null) as any,
      order_index: modules.length,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setTitle(""); setDescription(""); setGrade("");
    setOpen(false);
    load();
  };

  const deleteModule = async (id: string) => {
    if (!confirm(language === "ar" ? "حذف هذه الوحدة؟" : "Delete this module?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  // ---------- Grade picker (no grade selected) ----------
  if (!selectedGrade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {language === "ar" ? "اختر صفك" : "Choose your grade"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "لعرض الوحدات والدروس" : "to view modules and lessons"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GRADES.map((g) => (
              <Card
                key={g.value}
                className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-primary/10 group"
                onClick={() => setSearchParams({ grade: g.value })}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 group-hover:from-primary group-hover:to-violet-500 transition-all">
                    <GraduationCap className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      {language === "ar" ? g.labelAr : g.labelEn}
                    </div>
                    {userGrade === g.value && (
                      <div className="text-xs text-primary mt-1">
                        {language === "ar" ? "صفك" : "Your grade"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // ---------- Modules list for selected grade ----------
  const gradeMeta = GRADES.find((g) => g.value === selectedGrade);
  const gradeLabel = gradeMeta ? (language === "ar" ? gradeMeta.labelAr : gradeMeta.labelEn) : selectedGrade;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Button variant="ghost" onClick={() => setSearchParams({})} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === "ar" ? "تغيير الصف" : "Change grade"}
        </Button>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{language === "ar" ? "المنهج" : "Curriculum"}</h1>
              <p className="text-sm text-muted-foreground">{gradeLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedGrade} onValueChange={(v) => setSearchParams({ grade: v })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {language === "ar" ? g.labelAr : g.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isTeacher && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "ar" ? "وحدة جديدة" : "New Module"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{language === "ar" ? "إنشاء وحدة" : "Create Module"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{language === "ar" ? "العنوان" : "Title"}</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                      <Label>{language === "ar" ? "الوصف" : "Description"}</Label>
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div>
                      <Label>{language === "ar" ? "الصف" : "Grade"}</Label>
                      <Select value={grade || selectedGrade} onValueChange={setGrade}>
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>
                  <DialogFooter>
                    <Button onClick={createModule} disabled={saving || !title.trim()}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {language === "ar" ? "حفظ" : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : modules.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              {language === "ar" ? "لا توجد وحدات لهذا الصف بعد" : "No modules for this grade yet"}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((m) => (
              <Card
                key={m.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 border-primary/10"
                onClick={() => navigate(`/curriculum/${m.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{m.title}</CardTitle>
                      {m.grade && (
                        <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {m.grade}
                        </span>
                      )}
                    </div>
                    {isTeacher && m.teacher_id === userId && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); deleteModule(m.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  {m.description && <CardDescription>{m.description}</CardDescription>}
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

export default Curriculum;
