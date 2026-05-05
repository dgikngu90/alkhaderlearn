import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, Megaphone, GraduationCap, UserIcon } from "lucide-react";
import { GRADES } from "@/constants/grades";

interface Profile {
  id: string;
  full_name: string | null;
  grade: string | null;
}

interface SendMessageDialogProps {
  user: User;
}

type TargetMode = "all" | "grade" | "student";

const SendMessageDialog = ({ user }: SendMessageDialogProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<TargetMode>("all");
  const [recipientId, setRecipientId] = useState<string>("");
  const [targetGrade, setTargetGrade] = useState<string>("");
  const [students, setStudents] = useState<Profile[]>([]);

  useEffect(() => {
    if (open && mode === "student") {
      fetchStudents();
    }
  }, [open, mode]);

  const fetchStudents = async () => {
    try {
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (!studentRoles?.length) {
        setStudents([]);
        return;
      }

      const studentIds = studentRoles.map((r) => r.user_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, grade")
        .in("id", studentIds);

      setStudents(profiles || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ variant: "destructive", title: t("error"), description: t("fillAllFields") });
      return;
    }
    if (mode === "student" && !recipientId) {
      toast({ variant: "destructive", title: t("error"), description: t("selectRecipient") });
      return;
    }
    if (mode === "grade" && !targetGrade) {
      toast({ variant: "destructive", title: t("error"), description: language === "ar" ? "اختر الصف" : "Select a grade" });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        sender_id: user.id,
        title: title.trim(),
        content: content.trim(),
        is_broadcast: mode !== "student",
        recipient_id: mode === "student" ? recipientId : null,
        target_grade: mode === "grade" ? targetGrade : null,
      };

      const { error } = await supabase.from("messages").insert(payload);
      if (error) throw error;

      toast({ title: t("success"), description: t("messageSent") });
      setTitle("");
      setContent("");
      setRecipientId("");
      setTargetGrade("");
      setMode("all");
      setOpen(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({ variant: "destructive", title: t("error"), description: error.message || t("messageFailed") });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = targetGrade && mode === "student"
    ? students.filter((s) => s.grade === targetGrade)
    : students;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          {t("sendMessage")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("sendMessage")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "ar" ? "إرسال إلى" : "Send to"}</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as TargetMode)} className="grid grid-cols-1 gap-2">
              <Label htmlFor="m-all" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="all" id="m-all" />
                <Megaphone className="h-4 w-4" />
                <span>{language === "ar" ? "جميع الطلاب" : "All students"}</span>
              </Label>
              <Label htmlFor="m-grade" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="grade" id="m-grade" />
                <GraduationCap className="h-4 w-4" />
                <span>{language === "ar" ? "صف معين" : "Specific grade"}</span>
              </Label>
              <Label htmlFor="m-student" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="student" id="m-student" />
                <UserIcon className="h-4 w-4" />
                <span>{language === "ar" ? "طالب محدد" : "Specific student"}</span>
              </Label>
            </RadioGroup>
          </div>

          {mode === "grade" && (
            <div className="space-y-2">
              <Label>{language === "ar" ? "الصف" : "Grade"}</Label>
              <Select value={targetGrade} onValueChange={setTargetGrade}>
                <SelectTrigger>
                  <SelectValue placeholder={language === "ar" ? "اختر الصف" : "Select grade"} />
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
          )}

          {mode === "student" && (
            <>
              <div className="space-y-2">
                <Label>{language === "ar" ? "تصفية حسب الصف (اختياري)" : "Filter by grade (optional)"}</Label>
                <Select value={targetGrade || "all"} onValueChange={(v) => setTargetGrade(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "ar" ? "جميع الصفوف" : "All grades"}</SelectItem>
                    {GRADES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {language === "ar" ? g.labelAr : g.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient">{t("selectStudent")}</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectStudent")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                        {language === "ar" ? "لا يوجد طلاب" : "No students found"}
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name || "Unknown Student"}
                          {student.grade ? ` — ${student.grade}` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">{t("messageTitle")}</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("enterTitle")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t("messageContent")}</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("enterMessage")} rows={4} />
          </div>

          <Button onClick={handleSend} disabled={loading} className="w-full">
            {loading ? t("sending") : t("send")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;
