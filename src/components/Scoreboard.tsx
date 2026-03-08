import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, CheckCircle, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserScore {
  total_points: number;
  video_watch_time_minutes: number;
  quiz_correct_answers: number;
}

interface ScoreboardProps {
  user: User | null;
}

const Scoreboard = ({ user }: ScoreboardProps) => {
  const { t, language } = useLanguage();
  const [score, setScore] = useState<UserScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_scores")
        .select("total_points, video_watch_time_minutes, quiz_correct_answers")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setScore(data);
      } else {
        setScore({ total_points: 0, video_watch_time_minutes: 0, quiz_correct_answers: 0 });
      }
      setLoading(false);
    };

    fetchScore();
  }, [user]);

  if (loading || !user) {
    return null;
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {language === "ar" ? "لوحة النقاط" : "Scoreboard"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">
                {language === "ar" ? "إجمالي النقاط" : "Total Points"}
              </span>
            </div>
            <span className="text-2xl font-bold text-primary">{score?.total_points || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">
                {language === "ar" ? "دقائق المشاهدة" : "Watch Time"}
              </span>
            </div>
            <span className="text-lg font-semibold">{score?.video_watch_time_minutes || 0} min</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">
                {language === "ar" ? "الإجابات الصحيحة" : "Correct Answers"}
              </span>
            </div>
            <span className="text-lg font-semibold">{score?.quiz_correct_answers || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Scoreboard;
