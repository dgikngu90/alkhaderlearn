import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  teacher_id: string;
  created_at: string;
  quality_standard: string;
  quality_hd: string;
  category: string;
  teacher_name?: string;
}

interface VideoListProps {
  teacherId?: string;
  userId?: string;
  isTeacher: boolean;
  selectedCategory?: string;
  selectedGrade?: string;
}

const VideoList = ({ teacherId, userId, isTeacher, selectedCategory, selectedGrade }: VideoListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      let query = supabase.from("videos").select("*").order("created_at", { ascending: false });

      if (teacherId) {
        query = query.eq("teacher_id", teacherId);
      }

      if (selectedCategory) {
        query = query.eq("category", selectedCategory as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch teacher names
      const teacherIds = [...new Set(data?.map(v => v.teacher_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", teacherIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const videosWithNames = (data || []).map(v => ({
        ...v,
        teacher_name: profileMap.get(v.teacher_id) || undefined,
      }));
      setVideos(videosWithNames);

      // Generate signed URLs for thumbnails
      if (data) {
        const thumbnailPromises = data.map(async (video) => {
          if (video.thumbnail_url) {
            const path = extractStoragePath(video.thumbnail_url);
            const { data: signedData } = await supabase.storage
              .from('videos')
              .createSignedUrl(path, 3600);
            return { id: video.id, url: signedData?.signedUrl || '' };
          }
          return { id: video.id, url: '' };
        });

        const thumbnailResults = await Promise.all(thumbnailPromises);
        const thumbnailMap: Record<string, string> = {};
        thumbnailResults.forEach(({ id, url }) => {
          if (url) thumbnailMap[id] = url;
        });
        setThumbnailUrls(thumbnailMap);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const extractStoragePath = (url: string): string => {
    if (url.includes('/storage/v1/object/public/videos/')) {
      return url.split('/storage/v1/object/public/videos/')[1];
    } else if (url.startsWith('videos/')) {
      return url.replace('videos/', '');
    } else {
      return url;
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [teacherId, userId, selectedCategory]);

  const handleWatch = async (video: Video) => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    navigate(`/video/${video.id}`);
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm(t("video.delete.confirm"))) return;

    try {
      const { error } = await supabase.from("videos").delete().eq("id", videoId);

      if (error) throw error;

      toast({
        title: t("video.deleted"),
        description: t("video.deleted.desc"),
      });
      fetchVideos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    }
  };

  if (loading) {
    return <p className="text-muted-foreground text-center py-8">{t("video.loading")}</p>;
  }

  if (videos.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        {isTeacher ? t("video.none.teacher") : t("video.none.student")}
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          <CardHeader className="p-0">
            {thumbnailUrls[video.id] ? (
              <img
                src={thumbnailUrls[video.id]}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-2">{video.title}</CardTitle>
            <Badge variant="outline" className="mb-2">{video.category}</Badge>
            {video.teacher_name && (
              <p className="text-xs text-muted-foreground mt-1">
                {video.teacher_name}
              </p>
            )}
            {video.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {video.description}
              </p>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button
              size="sm"
              onClick={() => handleWatch(video)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {t("video.watch")}
            </Button>
            {isTeacher && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(video.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default VideoList;
