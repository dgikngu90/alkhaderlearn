import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ghost, Sparkles } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import StudentPacmanList from "@/components/StudentPacmanList";
import CreatePacmanGameForm from "@/components/CreatePacmanGameForm";
import TeacherPacmanList from "@/components/TeacherPacmanList";

const Games = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setIsTeacher((roles || []).some((r: any) => r.role === "teacher"));
      setLoading(false);
    })();
  }, [navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-orbs" />
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <Card className="glass-vibrant overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <Ghost className="h-6 w-6 text-background" />
                </div>
                <span className="gradient-text">Pacman Quiz Games</span>
              </CardTitle>
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <CardDescription>
              {isTeacher
                ? "Create question-based mazes for your students"
                : "Answer questions by reaching the right letter — earn 5 points each!"}
            </CardDescription>
          </CardHeader>
        </Card>

        {isTeacher ? (
          <>
            <CreatePacmanGameForm user={user} onCreated={() => setRefreshKey((k) => k + 1)} />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Pacman Games</CardTitle>
              </CardHeader>
              <CardContent>
                <TeacherPacmanList user={user} refreshKey={refreshKey} />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Games</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentPacmanList />
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Games;
