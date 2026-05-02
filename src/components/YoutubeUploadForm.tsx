import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Youtube } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { GRADES } from "@/constants/grades";

interface Props {
  user: User;
  onUploadComplete?: () => void;
}

export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const YoutubeUploadForm = ({ user, onUploadComplete }: Props) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("عربي");
  const [grade, setGrade] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const categories = ["عربي", "English", "علوم حياتية", "كيمياء", "علوم ارض", "رياضيات", "مالية"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYoutubeId(youtubeUrl.trim());
    if (!ytId) {
      toast({ variant: "destructive", title: "Invalid URL", description: "Please enter a valid YouTube link" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("videos").insert([{
        title,
        description,
        category: category as any,
        grade: (grade as any) || null,
        video_url: `youtube:${ytId}`,
        thumbnail_url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        teacher_id: user.id,
        quality_standard: `youtube:${ytId}`,
        quality_hd: `youtube:${ytId}`,
      }]);
      if (error) throw error;
      toast({ title: "Success!", description: "YouTube video added" });
      setTitle(""); setDescription(""); setCategory("عربي"); setGrade(""); setYoutubeUrl("");
      onUploadComplete?.();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Add YouTube Video
        </CardTitle>
        <CardDescription>Paste a YouTube link to publish it as a video</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="yt-url">YouTube URL</Label>
            <Input
              id="yt-url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yt-title">Title</Label>
            <Input id="yt-title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yt-desc">Description</Label>
            <Textarea id="yt-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={submitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("grade.label") || "Grade"}</Label>
            <Select value={grade} onValueChange={setGrade} disabled={submitting}>
              <SelectTrigger><SelectValue placeholder={t("grade.select") || "Select grade"} /></SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {language === "ar" ? g.labelAr : g.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Adding..." : "Add YouTube Video"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default YoutubeUploadForm;
