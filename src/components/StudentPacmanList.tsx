import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost, Play, CheckCircle2 } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string | null;
  grade: string | null;
}

const StudentPacmanList = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("pacman_games")
        .select("id, title, description, grade")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setGames((data as any) || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: attempts } = await supabase
          .from("pacman_attempts")
          .select("game_id")
          .eq("student_id", user.id);
        setPlayedIds(new Set((attempts || []).map((a: any) => a.game_id)));
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (games.length === 0) return <p className="text-muted-foreground text-sm">No games available yet.</p>;

  return (
    <div className="space-y-3">
      {games.map((g) => {
        const played = playedIds.has(g.id);
        return (
          <Card key={g.id} className="border-border hover:border-primary/40 transition-colors">
            <CardContent className="pt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shrink-0">
                  <Ghost className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{g.title}</p>
                  {g.description && <p className="text-xs text-muted-foreground truncate">{g.description}</p>}
                </div>
              </div>
              {played ? (
                <Button size="sm" variant="secondary" disabled className="shrink-0">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Played
                </Button>
              ) : (
                <Button size="sm" onClick={() => navigate(`/pacman/${g.id}`)} className="shrink-0">
                  <Play className="h-4 w-4 mr-1" /> Play
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StudentPacmanList;
