import { useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { GRADES } from "@/constants/grades";

interface VideoUploadFormProps {
  user: User;
  onUploadComplete?: () => void;
}

const VideoUploadForm = ({ user, onUploadComplete }: VideoUploadFormProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("عربي");
  const [grade, setGrade] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string>("");
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const uploadStartTimeRef = useRef<number>(0);

  const categories = ["عربي", "English", "علوم حياتية", "احياء", "كيمياء", "فيزياء", "علوم الارض", "رياضيات", "حاسوب", "مالية", "تاريخ", "جغرافيه", "وطنيه", "دين", "مهني"];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
    setUploadSpeed("");
    toast({ title: "Upload cancelled" });
  };

  const uploadFileWithProgress = async (
    file: File,
    path: string,
    onProgress: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      uploadStartTimeRef.current = Date.now();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);

          // Calculate speed
          const elapsed = (Date.now() - uploadStartTimeRef.current) / 1000;
          if (elapsed > 0.5) {
            const speedBps = event.loaded / elapsed;
            const remaining = (event.total - event.loaded) / speedBps;
            const mins = Math.floor(remaining / 60);
            const secs = Math.floor(remaining % 60);
            setUploadSpeed(
              `${formatFileSize(speedBps)}/s • ${mins > 0 ? `${mins}m ` : ""}${secs}s remaining`
            );
          }
        }
      });

      xhr.addEventListener("load", () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(path);
        } else {
          reject(new Error(`Upload failed (${xhr.status}). Please try again.`));
        }
      });

      xhr.addEventListener("error", () => {
        xhrRef.current = null;
        reject(new Error("Upload failed. Check your internet connection and try again."));
      });

      xhr.addEventListener("abort", () => {
        xhrRef.current = null;
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          reject(new Error("Not authenticated"));
          return;
        }

        const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/videos/${path}`;
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("x-upsert", "true");
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.send(file);
      });
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a video file" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadSpeed("");

    try {
      const videoFileName = `${user.id}/${Date.now()}_${videoFile.name}`;

      await uploadFileWithProgress(videoFile, videoFileName, (progress) => {
        setUploadProgress(Math.round(progress * 0.9));
      });

      const videoUrl = `videos/${videoFileName}`;

      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailFileName = `${user.id}/${Date.now()}_thumb_${thumbnailFile.name}`;
        const { error: thumbError } = await supabase.storage
          .from("videos")
          .upload(thumbnailFileName, thumbnailFile);
        if (thumbError) throw thumbError;
        thumbnailUrl = `videos/${thumbnailFileName}`;
        setUploadProgress(95);
      }

      const { error: dbError } = await supabase.from("videos").insert([{
        title,
        description,
        category: category as any,
        grade: grade as any || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        teacher_id: user.id,
        quality_standard: videoUrl,
        quality_hd: videoUrl,
      }]);

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast({ title: "Success!", description: "Video uploaded successfully" });

      setTitle("");
      setDescription("");
      setCategory("عربي");
      setGrade("");
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
      setUploadSpeed("");
      onUploadComplete?.();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const fileSizeWarning = videoFile && videoFile.size > 100 * 1024 * 1024;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload New Video
        </CardTitle>
        <CardDescription>Share your knowledge with students</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Introduction to Mathematics" required disabled={uploading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the video content..." rows={3} disabled={uploading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={uploading}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">{t("grade.label") || "Grade"}</Label>
            <Select value={grade} onValueChange={setGrade} disabled={uploading}>
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

          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            <Input id="video" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} required disabled={uploading} />
            {videoFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {videoFile.name} ({formatFileSize(videoFile.size)})
              </p>
            )}
            {fileSizeWarning && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Large file — upload may take several minutes on slow connections.</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
            <Input id="thumbnail" type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} disabled={uploading} />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              {uploadSpeed && (
                <p className="text-xs text-muted-foreground">{uploadSpeed}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? `Uploading... ${uploadProgress}%` : "Upload Video"}
            </Button>
            {uploading && (
              <Button type="button" variant="destructive" onClick={cancelUpload} size="icon">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VideoUploadForm;
