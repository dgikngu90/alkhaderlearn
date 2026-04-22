import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Ghost as GhostIcon } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

// Maze legend: 1 = wall, 0 = open
// 19x21 grid (cols x rows)
const MAZE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,0,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0],
  [1,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,1],
  [0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const ROWS = MAZE.length;
const COLS = MAZE[0].length;
const CELL = 22;

// Letter answer positions (corners-ish, all in open cells)
const LETTER_POSITIONS: Record<"a" | "b" | "c" | "d", { x: number; y: number }> = {
  a: { x: 1, y: 1 },
  b: { x: COLS - 2, y: 1 },
  c: { x: 1, y: ROWS - 2 },
  d: { x: COLS - 2, y: ROWS - 2 },
};

// Player spawn (center)
const SPAWN = { x: 9, y: 10 };

// Ghost spawns - placed far from player spawn so they can't trap the player instantly
const GHOST_SPAWNS = [
  { x: 1, y: 10 },
  { x: COLS - 2, y: 10 },
  { x: 9, y: 1 },
  { x: 9, y: ROWS - 2 },
];

interface Question {
  id: string;
  question_text: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  correct_answer: "a" | "b" | "c" | "d";
}

type Dir = { dx: number; dy: number };
const DIRS: Record<string, Dir> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const isWall = (x: number, y: number) => {
  if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return true;
  return MAZE[y][x] === 1;
};

const PacmanGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameTitle, setGameTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<"intro" | "playing" | "finished">("intro");
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);

  // Player & ghosts state held in refs for smooth game loop
  const playerRef = useRef({ x: SPAWN.x, y: SPAWN.y });
  const dirRef = useRef<Dir>({ dx: 0, dy: 0 });
  const queuedDirRef = useRef<Dir | null>(null);
  const ghostsRef = useRef(GHOST_SPAWNS.map((g) => ({ ...g, dir: DIRS.up })));
  const lastTickRef = useRef(0);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef(phase);
  const graceRef = useRef(0); // ticks of invulnerability after spawn/respawn
  phaseRef.current = phase;

  // Auth & data fetch
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    });
  }, [navigate]);

  useEffect(() => {
    if (!gameId) return;
    (async () => {
      const { data: game } = await supabase
        .from("pacman_games")
        .select("title")
        .eq("id", gameId)
        .maybeSingle();
      const { data: qs } = await supabase
        .from("pacman_questions")
        .select("*")
        .eq("game_id", gameId)
        .order("order_index", { ascending: true });
      setGameTitle(game?.title || "Pacman Game");
      setQuestions((qs as any) || []);
      setLoading(false);
    })();
  }, [gameId]);

  const resetPositions = useCallback(() => {
    playerRef.current = { x: SPAWN.x, y: SPAWN.y };
    dirRef.current = { dx: 0, dy: 0 };
    queuedDirRef.current = null;
    ghostsRef.current = GHOST_SPAWNS.map((g) => ({ ...g, dir: DIRS.up }));
    graceRef.current = 12; // ~2 seconds of grace time after spawn
  }, []);

  const currentQuestion = questions[qIndex];

  const finishGame = useCallback(async () => {
    setPhase("finished");
    if (!user || !gameId) return;
    try {
      await supabase.from("pacman_attempts").insert({
        game_id: gameId,
        student_id: user.id,
        correct_count: correctCount,
        points_earned: points,
      });
      if (points > 0) {
        await supabase.rpc("add_points", {
          p_user_id: user.id,
          p_points: points,
          p_correct_answers: correctCount,
        });
      }
    } catch (err: any) {
      toast({ title: "Save error", description: err.message, variant: "destructive" });
    }
  }, [user, gameId, correctCount, points, toast]);

  const advance = useCallback(
    (chosen: "a" | "b" | "c" | "d") => {
      if (!currentQuestion) return;
      const isCorrect = chosen === currentQuestion.correct_answer;
      if (isCorrect) {
        setPoints((p) => p + 5);
        setCorrectCount((c) => c + 1);
        setShowFeedback("correct");
      } else {
        setShowFeedback("wrong");
      }

      setTimeout(() => {
        setShowFeedback(null);
        if (qIndex + 1 >= questions.length) {
          finishGame();
        } else {
          setQIndex((i) => i + 1);
          resetPositions();
          setPhase("intro");
        }
      }, 1200);
    },
    [currentQuestion, qIndex, questions.length, finishGame, resetPositions]
  );

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== "playing") return;
      const map: Record<string, Dir> = {
        ArrowUp: DIRS.up,
        ArrowDown: DIRS.down,
        ArrowLeft: DIRS.left,
        ArrowRight: DIRS.right,
        w: DIRS.up,
        s: DIRS.down,
        a: DIRS.left,
        d: DIRS.right,
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        queuedDirRef.current = d;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleDirButton = (d: Dir) => {
    if (phaseRef.current !== "playing") return;
    queuedDirRef.current = d;
  };

  // Game loop
  useEffect(() => {
    if (phase !== "playing" || !currentQuestion) return;

    const TICK_MS = 180;

    const loop = (ts: number) => {
      if (!lastTickRef.current) lastTickRef.current = ts;
      const elapsed = ts - lastTickRef.current;

      if (elapsed >= TICK_MS) {
        lastTickRef.current = ts;
        // Player movement
        const queued = queuedDirRef.current;
        const player = playerRef.current;
        if (queued) {
          const nx = player.x + queued.dx;
          const ny = player.y + queued.dy;
          if (!isWall(nx, ny)) {
            dirRef.current = queued;
            queuedDirRef.current = null;
          }
        }
        const dir = dirRef.current;
        const nx = player.x + dir.dx;
        const ny = player.y + dir.dy;
        if (!isWall(nx, ny)) {
          // tunnel wrap
          let fx = nx;
          if (fx < 0) fx = COLS - 1;
          if (fx >= COLS) fx = 0;
          playerRef.current = { x: fx, y: ny };
        }

        // Check letter collision
        const p = playerRef.current;
        for (const letter of ["a", "b", "c", "d"] as const) {
          const lp = LETTER_POSITIONS[letter];
          if (p.x === lp.x && p.y === lp.y) {
            advance(letter);
            // Stop loop iteration
            draw();
            return;
          }
        }

        // Ghost movement (frozen during grace period)
        if (graceRef.current > 0) {
          graceRef.current -= 1;
        } else {
          ghostsRef.current = ghostsRef.current.map((g) => {
            const candidates: Dir[] = [];
            for (const d of Object.values(DIRS)) {
              if (d.dx === -g.dir.dx && d.dy === -g.dir.dy) continue;
              if (!isWall(g.x + d.dx, g.y + d.dy)) candidates.push(d);
            }
            let chosen = g.dir;
            if (candidates.length > 0) {
              if (Math.random() < 0.5) {
                const pr = playerRef.current;
                candidates.sort((a, b) => {
                  const da = Math.abs(g.x + a.dx - pr.x) + Math.abs(g.y + a.dy - pr.y);
                  const db = Math.abs(g.x + b.dx - pr.x) + Math.abs(g.y + b.dy - pr.y);
                  return da - db;
                });
                chosen = candidates[0];
              } else {
                chosen = candidates[Math.floor(Math.random() * candidates.length)];
              }
            } else if (!isWall(g.x - g.dir.dx, g.y - g.dir.dy)) {
              chosen = { dx: -g.dir.dx, dy: -g.dir.dy };
            }
            let nx = g.x + chosen.dx;
            if (nx < 0) nx = COLS - 1;
            if (nx >= COLS) nx = 0;
            return { x: nx, y: g.y + chosen.dy, dir: chosen };
          });

          // Check ghost collision -> respawn player (only when not in grace)
          const pp = playerRef.current;
          for (const g of ghostsRef.current) {
            if (g.x === pp.x && g.y === pp.y) {
              resetPositions();
              break;
            }
          }
        }
      }

      draw();
      animationRef.current = requestAnimationFrame(loop);
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#0a0a14";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Walls
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (MAZE[y][x] === 1) {
            ctx.fillStyle = "#1e3a8a";
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 1;
            ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
          }
        }
      }

      // Letters
      ctx.font = `bold ${CELL - 4}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const letter of ["a", "b", "c", "d"] as const) {
        const lp = LETTER_POSITIONS[letter];
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(lp.x * CELL + CELL / 2, lp.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0a0a14";
        ctx.fillText(letter.toUpperCase(), lp.x * CELL + CELL / 2, lp.y * CELL + CELL / 2 + 1);
      }

      // Player (Pacman)
      const p = playerRef.current;
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(p.x * CELL + CELL / 2, p.y * CELL + CELL / 2, CELL / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.lineTo(p.x * CELL + CELL / 2, p.y * CELL + CELL / 2);
      ctx.fill();

      // Ghosts
      const ghostColors = ["#ef4444", "#ec4899", "#06b6d4", "#a78bfa"];
      ghostsRef.current.forEach((g, i) => {
        ctx.fillStyle = ghostColors[i % ghostColors.length];
        const cx = g.x * CELL + CELL / 2;
        const cy = g.y * CELL + CELL / 2;
        const r = CELL / 2 - 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, 0);
        ctx.lineTo(cx + r, cy + r);
        ctx.lineTo(cx - r, cy + r);
        ctx.closePath();
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(cx - r / 3, cy - r / 4, r / 4, 0, Math.PI * 2);
        ctx.arc(cx + r / 3, cy - r / 4, r / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(cx - r / 3, cy - r / 4, r / 8, 0, Math.PI * 2);
        ctx.arc(cx + r / 3, cy - r / 4, r / 8, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    lastTickRef.current = 0;
    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [phase, currentQuestion, advance]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p>This game has no questions.</p>
            <Button onClick={() => navigate("/games")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-orbs" />
      <div className="px-4 py-4 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/games")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="font-bold text-lg truncate">{gameTitle}</h1>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Trophy className="h-4 w-4" /> {points}
          </div>
        </div>

        {phase === "finished" ? (
          <Card className="glass-vibrant">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <Trophy className="h-16 w-16 mx-auto text-amber-500" />
              <h2 className="text-3xl font-bold gradient-text">Game Over!</h2>
              <p className="text-lg">
                You earned <span className="font-bold text-amber-500">{points}</span> points
              </p>
              <p className="text-sm text-muted-foreground">
                {correctCount} / {questions.length} correct answers
              </p>
              <div className="flex gap-2 justify-center pt-4">
                <Button onClick={() => navigate("/games")} variant="outline">
                  Back to Games
                </Button>
                <Button onClick={() => window.location.reload()}>Play Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Question display */}
            <Card className="glass border-primary/30">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Question {qIndex + 1} / {questions.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <GhostIcon className="h-3 w-3" /> Reach the right letter!
                  </span>
                </div>
                <p className="font-semibold text-base">{currentQuestion.question_text}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(["a", "b", "c", "d"] as const).map((letter) => (
                    <div key={letter} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-background font-bold flex items-center justify-center text-xs">
                        {letter.toUpperCase()}
                      </span>
                      <span className="truncate">{currentQuestion[`answer_${letter}`]}</span>
                    </div>
                  ))}
                </div>
                {phase === "intro" && (
                  <Button onClick={() => setPhase("playing")} className="w-full">
                    Start
                  </Button>
                )}
                {showFeedback && (
                  <div
                    className={`text-center font-bold py-2 rounded-lg ${
                      showFeedback === "correct"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {showFeedback === "correct" ? "+5 Correct!" : "Wrong answer"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Maze */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={COLS * CELL}
                height={ROWS * CELL}
                className="rounded-lg border border-primary/30 max-w-full h-auto"
                style={{ touchAction: "none" }}
              />
            </div>

            {/* Mobile controls */}
            <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto select-none">
              <div />
              <Button variant="outline" size="lg" onClick={() => handleDirButton(DIRS.up)}>
                ▲
              </Button>
              <div />
              <Button variant="outline" size="lg" onClick={() => handleDirButton(DIRS.left)}>
                ◀
              </Button>
              <Button variant="outline" size="lg" onClick={() => handleDirButton(DIRS.down)}>
                ▼
              </Button>
              <Button variant="outline" size="lg" onClick={() => handleDirButton(DIRS.right)}>
                ▶
              </Button>
            </div>
          </>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default PacmanGame;
