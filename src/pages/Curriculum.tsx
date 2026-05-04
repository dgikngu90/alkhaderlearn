import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, Plus, Trash2, Loader2 } from "lucide-react";
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
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    setIsTeacher(!!roles?.some((r) => r.role === "teacher"));

    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setModules((data as Module[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

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
    setTitle("");
    setDescription("");
    setGrade("");
    setOpen(false);
    load();
  };

  const deleteModule = async (id: string) => {
    if (!confirm(language === "ar" ? "حذف هذه الوحدة؟" : "Delete this module?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      load();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{language === "ar" ? "المنهج" : "Curriculum"}</h1>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "الوحدات والدروس" : "Modules and lessons"}
              </p>
            </div>
          </div>

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
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "ar" ? "اختر الصف (اختياري)" : "Select grade (optional)"} />
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : modules.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              {language === "ar" ? "لا توجد وحدات بعد" : "No modules yet"}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteModule(m.id);
                        }}
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
