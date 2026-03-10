import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import StudentDashboard from "@/components/StudentDashboard";
import TeacherDashboard from "@/components/TeacherDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"student" | "teacher" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      }
    );

    const bootstrapSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) throw error;
        if (!isMounted) return;

        if (currentSession?.user) {
          const { data: isBanned, error: banError } = await supabase.rpc("is_user_banned", {
            user_id: currentSession.user.id,
          });

          if (!isMounted) return;

          if (banError && import.meta.env.DEV) {
            console.error("Ban check failed:", banError);
          }

          if (isBanned) {
            await supabase.auth.signOut();
            if (!isMounted) return;
            setSession(null);
            setUser(null);
            navigate("/auth");
            return;
          }
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Session bootstrap failed:", error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    bootstrapSession();

    const loadingFallback = window.setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 10000);

    return () => {
      isMounted = false;
      window.clearTimeout(loadingFallback);
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      if (!user) {
        setRole("student");
        return;
      }

      setRole(null);

      const roleFallback = window.setTimeout(() => {
        if (isMounted) setRole("student");
      }, 8000);

      try {
        const [adminRes, teacherRes, studentRes] = await Promise.all([
          supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
          supabase.rpc("has_role", { _user_id: user.id, _role: "teacher" }),
          supabase.rpc("has_role", { _user_id: user.id, _role: "student" }),
        ]);

        if (!isMounted) return;

        const hasRpcError = adminRes.error || teacherRes.error || studentRes.error;

        if (!hasRpcError) {
          const isAdmin = adminRes.data === true;
          const isTeacher = teacherRes.data === true;
          const isStudent = studentRes.data === true;

          if (isAdmin) { setRole("admin"); return; }
          if (isTeacher) { setRole("teacher"); return; }
          if (isStudent) { setRole("student"); return; }
        }

        console.warn("RPC role check failed or returned no match, trying direct query", {
          adminErr: adminRes.error, teacherErr: teacherRes.error, studentErr: studentRes.error
        });

        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (!isMounted) return;

        if (!rolesError && roles && roles.length > 0) {
          const roleValues = roles.map(r => r.role);
          if (roleValues.includes("admin")) { setRole("admin"); return; }
          if (roleValues.includes("teacher")) { setRole("teacher"); return; }
          if (roleValues.includes("student")) { setRole("student"); return; }
        }

        setRole("student");
      } catch (error) {
        console.error("Error resolving role:", error);
        if (isMounted) setRole("student");
      } finally {
        window.clearTimeout(roleFallback);
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: t("dashboard.signout"),
      description: "Come back soon!",
    });
    navigate("/auth");
  };

  if (loading || role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Alkhader Learn" className="h-10 w-auto" />
            <h1 className="text-xl font-bold text-foreground hidden sm:block">{t("app.title")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/settings")} variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            {user ? (
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                {t("dashboard.signout")}
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="outline" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                {t("get.started")}
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {role === "admin" ? (
        <main className="container mx-auto px-4 py-8">
          <AdminDashboard user={user!} />
        </main>
      ) : role === "teacher" ? (
        <main className="container mx-auto px-4 py-8">
          <TeacherDashboard user={user!} />
        </main>
      ) : (
        <StudentDashboard user={user} />
      )}
    </div>
  );
};

export default Dashboard;
