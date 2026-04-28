import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Users } from "lucide-react";

interface Props {
  contentId: string;
  contentTitle: string;
  type: "quiz" | "pacman";
  trigger?: React.ReactNode;
}

interface Row {
  id: string;
  student_name: string;
  score: string;
  date: string;
}

const StudentScoresDialog = ({ contentId, contentTitle, type, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      let attempts: any[] = [];
      if (type === "quiz") {
        const { data } = await supabase
          .from("quiz_attempts")
          .select("id, student_id, score, max_score, submitted_at, status")
          .eq("quiz_id", contentId)
          .eq("status", "graded")
          .order("submitted_at", { ascending: false });
        attempts = data || [];
      } else {
        const { data } = await supabase
          .from("pacman_attempts")
          .select("id, student_id, points_earned, correct_count, completed_at")
          .eq("game_id", contentId)
          .order("completed_at", { ascending: false });
        attempts = data || [];
      }

      const studentIds = [...new Set(attempts.map((a) => a.student_id))];
      let nameMap = new Map<string, string>();
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);
        nameMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name || "Unknown"]));
      }

      const formatted: Row[] = attempts.map((a) => ({
        id: a.id,
        student_name: nameMap.get(a.student_id) || "Unknown student",
        score:
          type === "quiz"
            ? `${a.score ?? 0} / ${a.max_score ?? 0}`
            : `${a.points_earned} pts (${a.correct_count} correct)`,
        date: new Date(type === "quiz" ? a.submitted_at : a.completed_at).toLocaleDateString(),
      }));
      setRows(formatted);
      setLoading(false);
    })();
  }, [open, contentId, type]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-1" /> Scores
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="truncate">{contentTitle}</span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-muted-foreground text-sm py-4 text-center">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No attempts yet.</p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.student_name}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <div className="font-bold text-amber-500 text-sm shrink-0 ml-2">{r.score}</div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentScoresDialog;
