import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Mail, ClipboardList, Users, Eye, Trophy, Inbox } from "lucide-react";
import VideoList from "./VideoList";
import VideoUploadForm from "./VideoUploadForm";
import SendMessageDialog from "./SendMessageDialog";
import CreateQuizForm from "./CreateQuizForm";
import TeacherQuizList from "./TeacherQuizList";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard = ({ user }: TeacherDashboardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [quizRefreshKey, setQuizRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    videoCount: 0,
    quizCount: 0,
    totalStudents: 0,
    totalViews: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Get teacher's videos
      const { count: vCount } = await supabase
        .from("videos")
        .select("*", { count: 'exact', head: true })
        .eq("teacher_id", user.id);

      // Get teacher's quizzes
      const { count: qCount } = await supabase
        .from("quizzes")
        .select("*", { count: 'exact', head: true })
        .eq("teacher_id", user.id);

      // Get all students count (generic for now)
      const { count: sCount } = await supabase
        .from("user_roles")
        .select("*", { count: 'exact', head: true })
        .eq("role", "student");

      setStats({
        videoCount: vCount || 0,
        quizCount: qCount || 0,
        totalStudents: sCount || 0,
        totalViews: 0 // View tracking would need more logic
      });
    };
    fetchStats();
  }, [user.id, refreshKey, quizRefreshKey]);

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-morphism border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
                <h3 className="text-2xl font-bold">{stats.videoCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-accent/20 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <ClipboardList className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Quizzes</p>
                <h3 className="text-2xl font-bold">{stats.quizCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <h3 className="text-2xl font-bold">--</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Messaging Section */}
        <Card className="glass overflow-hidden border-border/50">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {t("messages")}
            </CardTitle>
            <CardDescription>{t("sendMessage")}</CardDescription>
          </CardHeader>
          <CardContent className="py-6 flex flex-wrap gap-4">
            <SendMessageDialog user={user} />
            <Button variant="outline" onClick={() => navigate("/messages")} className="flex-1 sm:flex-none">
              <Inbox className="h-4 w-4 mr-2" />
              {t("messages")}
            </Button>
          </CardContent>
        </Card>

        <VideoUploadForm user={user} onUploadComplete={handleUploadComplete} />
      </div>

      {/* Quizzes Section */}
      <Card className="glass border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t("quiz.section")}
          </CardTitle>
          <CardDescription>{t("quiz.sectionDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <CreateQuizForm user={user} onQuizCreated={() => setQuizRefreshKey(prev => prev + 1)} />
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-accent" />
              {t("quiz.myQuizzes")}
            </h3>
            <TeacherQuizList user={user} refreshKey={quizRefreshKey} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            My Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <VideoList key={refreshKey} teacherId={user.id} isTeacher={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;