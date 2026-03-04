import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { attempt_id } = await req.json();
    if (!attempt_id) throw new Error("attempt_id is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch attempt with quiz and questions
    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("id", attempt_id)
      .single();

    if (attemptErr || !attempt) throw new Error("Attempt not found");

    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", attempt.quiz_id)
      .order("order_index");

    if (qErr || !questions) throw new Error("Questions not found");

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("title")
      .eq("id", attempt.quiz_id)
      .single();

    const answers = attempt.answers as Record<string, string>;
    let totalScore = 0;
    let maxScore = 0;
    const details: { question: string; studentAnswer: string; correctAnswer: string; correct: boolean; points: number }[] = [];

    for (const q of questions) {
      maxScore += q.points;
      const studentAnswer = answers[q.id] || "";
      const isCorrect = studentAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
      if (isCorrect) totalScore += q.points;
      details.push({
        question: q.question_text,
        studentAnswer,
        correctAnswer: q.correct_answer,
        correct: isCorrect,
        points: q.points,
      });
    }

    // Use AI for feedback on text answers
    let aiFeedback = "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (LOVABLE_API_KEY) {
      try {
        const prompt = `You are a teacher grading a quiz titled "${quiz?.title || "Quiz"}".
Here are the results:
${details.map((d, i) => `Q${i+1}: ${d.question}
Student Answer: ${d.studentAnswer || "(no answer)"}
Correct Answer: ${d.correctAnswer}
Result: ${d.correct ? "✅ Correct" : "❌ Wrong"}`).join("\n\n")}

Score: ${totalScore}/${maxScore}

Provide brief, encouraging feedback in 2-3 sentences. If the student made mistakes, briefly explain the correct answers. Respond in the same language as the questions.`;

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          aiFeedback = aiData.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("AI feedback error:", e);
      }
    }

    // Update attempt with results
    const { error: updateErr } = await supabase
      .from("quiz_attempts")
      .update({
        score: totalScore,
        max_score: maxScore,
        ai_feedback: aiFeedback,
        status: "graded",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", attempt_id);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ score: totalScore, max_score: maxScore, ai_feedback: aiFeedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grade-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
