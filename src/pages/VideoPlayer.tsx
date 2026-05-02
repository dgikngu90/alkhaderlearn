import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const VideoPlayer = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchTime, setWatchTime] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadVideo = async () => {
      if (!videoId) {
        setError("Video ID is missing");
        setLoading(false);
        return;
      }

      try {
        // Get video details
        const { data: video, error: videoError } = await supabase
          .from("videos")
          .select("*")
          .eq("id", videoId)
          .single();

        if (videoError || !video) {
          setError("Video not found");
          setLoading(false);
          return;
        }

        setVideoTitle(video.title);

        // YouTube video — set URL directly, skip storage
        if (video.video_url?.startsWith("youtube:")) {
          const ytId = video.video_url.replace("youtube:", "");
          setVideoUrl(`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`);
          setLoading(false);
          return;
        }

        // Extract storage path
        const extractStoragePath = (url: string): string => {
          if (url.includes('/storage/v1/object/public/videos/')) {
            return url.split('/storage/v1/object/public/videos/')[1];
          } else if (url.startsWith('videos/')) {
            return url.replace('videos/', '');
          } else {
            return url;
          }
        };

        const videoPath = extractStoragePath(video.video_url);

        // Get signed URL
        const { data: signedData, error: signedError } = await supabase.storage
          .from('videos')
          .createSignedUrl(videoPath, 3600);

        if (signedError || !signedData) {
          setError("Failed to load video");
          setLoading(false);
          return;
        }

        setVideoUrl(signedData.signedUrl);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    loadVideo();
  }, [videoId]);

  useEffect(() => {
    const fetchUserAndTrack = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const video = videoRef.current;
      if (!video) return;

      const handlePlay = () => {
        timerRef.current = setInterval(async () => {
          watchTimeRef.current += 1;
          setWatchTime(watchTimeRef.current);
          
          if (watchTimeRef.current % 60 === 0) {
            const minutes = Math.floor(watchTimeRef.current / 60);
            setEarnedPoints(minutes);
          }
        }, 1000);
      };

      const handlePause = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      const handleEnded = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const minutes = Math.floor(watchTimeRef.current / 60);
        if (minutes > 0) {
          setEarnedPoints(minutes);
          // Save watch time points to database
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              await supabase.rpc("add_points", {
                p_user_id: currentUser.id,
                p_points: minutes,
                p_correct_answers: 0,
                p_watch_minutes: minutes,
              });
            }
          } catch (err) {
            console.error("Failed to save watch points:", err);
          }
        }
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    };

    fetchUserAndTrack();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">{t("video.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto py-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        
        <h1 className="text-white text-xl font-bold mb-4 px-4">{videoTitle}</h1>
        
        <div className="w-full max-w-5xl mx-auto">
          {videoUrl && videoUrl.includes("youtube.com/embed") ? (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={videoUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={videoTitle}
              />
            </div>
          ) : videoUrl ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              className="w-full rounded-lg"
              controlsList="nodownload"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>
        
        {earnedPoints > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4 text-yellow-400">
            <Trophy className="h-5 w-5" />
            <span className="font-bold">+{earnedPoints} {t("score.points") || "points earned!"}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
