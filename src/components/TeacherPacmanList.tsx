import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Ghost } from "lucide-react";
import StudentScoresDialog from "./StudentScoresDialog";
import { useToast } from "@/hooks/use-toast";

interface Props {
  user: User;
  refreshKey: number;
}

interface Game {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  grade: string | null;
}

const TeacherPacmanList = ({ user, refreshKey }: Props) => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pacman_games")
      .select("id, title, description, is_published, grade")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setGames((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, [user.id, refreshKey]);

  const togglePublish = async (g: Game) => {
    const { error } = await supabase
      .from("pacman_games")
      .update({ is_published: !g.is_published })
      .eq("id", g.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchGames();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this game?")) return;
    const { error } = await supabase.from("pacman_games").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchGames();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (games.length === 0) return <p className="text-muted-foreground text-sm">No Pacman games yet.</p>;

  return (
    <div className="space-y-3">
      {games.map((g) => (
        <Card key={g.id} className="border-border">
          <CardContent className="pt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Ghost className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{g.title}</p>
                {g.description && <p className="text-xs text-muted-foreground truncate">{g.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Switch checked={g.is_published} onCheckedChange={() => togglePublish(g)} />
                <span className="text-xs text-muted-foreground">{g.is_published ? "Live" : "Draft"}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(g.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeacherPacmanList;
