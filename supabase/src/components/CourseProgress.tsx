import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Video } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CourseProgressProps {
    userId: string;
}

const CourseProgress = ({ userId }: CourseProgressProps) => {
    const { t } = useLanguage();
    const [progress, setProgress] = useState({ watched: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                // Get total videos
                const { count: totalCount } = await supabase
                    .from("videos")
                    .select("*", { count: 'exact', head: true });

                // Get unique videos watched by user
                const { count: watchedCount } = await supabase
                    .from("video_views")
                    .select("video_id", { count: 'exact', head: true })
                    .eq("user_id", userId);

                setProgress({
                    watched: watchedCount || 0,
                    total: totalCount || 0
                });
            } catch (error) {
                console.error("Error fetching progress:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [userId]);

    if (loading || progress.total === 0) return null;

    const percentage = Math.round((progress.watched / progress.total) * 100);

    return (
        <Card className="glass border-primary/20 bg-primary/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="h-12 w-12 text-primary" />
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Learning Progress
                </CardTitle>
                <CardDescription>
                    You have watched {progress.watched} out of {progress.total} videos
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Overall Completion</span>
                        <span className="text-primary">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Video className="h-3 w-3" />
                            {progress.watched} Lessons watched
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                            <Trophy className="h-3 w-3" />
                            Keep going!
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CourseProgress;
