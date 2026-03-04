import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Mail, ClipboardList } from "lucide-react";
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

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Messaging Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t("messages")}
          </CardTitle>
          <CardDescription>{t("sendMessage")}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <SendMessageDialog user={user} />
          <Button variant="outline" onClick={() => navigate("/messages")}>
            {t("messages")}
          </Button>
        </CardContent>
      </Card>

      <VideoUploadForm user={user} onUploadComplete={handleUploadComplete} />

      {/* Quizzes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t("quiz.section")}
          </CardTitle>
          <CardDescription>{t("quiz.sectionDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CreateQuizForm user={user} onQuizCreated={() => setQuizRefreshKey(prev => prev + 1)} />
          <div>
            <h3 className="font-semibold text-lg mb-3">{t("quiz.myQuizzes")}</h3>
            <TeacherQuizList user={user} refreshKey={quizRefreshKey} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            My Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VideoList key={refreshKey} teacherId={user.id} isTeacher={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;