import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Sparkles, Bot, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const StudyAssistantChat = () => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isArabic = language === "ar";

  const title = isArabic ? "مساعد دراسي بالذكاء الاصطناعي" : "AI Study Assistant";
  const subtitle = isArabic
    ? "اسأل عن دروسك في أي مادة واحصل على مساعدة فورية."
    : "Ask questions about your subjects and get instant help.";
  const placeholder = isArabic
    ? "اكتب سؤالاً عن دروسك (بالعربية أو بالإنجليزية)..."
    : "Ask a question about your lessons (in Arabic or English)...";
  const emptyState = isArabic
    ? "ابدأ بكتابة سؤالك الأول للتحدث مع المساعد."
    : "Ask your first question to start chatting with the assistant.";
  const sendLabel = isArabic ? "اسأل" : "Ask";
  const loadingLabel = isArabic ? "يفكر..." : "Thinking...";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("study-assistant", {
        body: {
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (error) {
        console.error("Study assistant error:", error);
        throw error;
      }

      const typedData = data as { reply?: string } | null;
      const replyText = typedData?.reply;

      if (!replyText) {
        throw new Error("No response from study assistant");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error calling study assistant:", err);
      const description =
        err && typeof err === "object" && "message" in err
          ? String((err as any).message)
          : isArabic
            ? "حدث خطأ أثناء الاتصال بالمساعد الدراسي. يرجى المحاولة مرة أخرى."
            : "Something went wrong while contacting the study assistant. Please try again.";

      toast({
        title: t("error"),
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="glass-vibrant border-border/50 overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-accent" />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <span className="gradient-text">{title}</span>
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse ml-auto" />
        </CardTitle>
        <CardDescription className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          {subtitle}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        <div className="h-80 rounded-2xl p-4 bg-gradient-to-br from-secondary/30 to-primary/5 overflow-y-auto border border-primary/10">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto animate-float">
                  <Bot className="h-10 w-10 text-violet-500" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">{emptyState}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary cursor-pointer hover:bg-primary/20" onClick={() => setInput(isArabic ? "كيف أذاكر الرياضيات؟" : "How do I study math?")}>
                    📐 {isArabic ? "رياضيات" : "Math"}
                  </Badge>
                  <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent cursor-pointer hover:bg-accent/20" onClick={() => setInput(isArabic ? "كيف أذاكر الكيمياء؟" : "How do I study chemistry?")}>
                    🧪 {isArabic ? "كيمياء" : "Chemistry"}
                  </Badge>
                  <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/20 text-cyan-600 cursor-pointer hover:bg-cyan-500/20" onClick={() => setInput(isArabic ? "كيف أذاكر اللغة الإنجليزية؟" : "How do I study English?")}>
                    📚 English
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg"
                        : "max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-gradient-to-br from-card to-violet-500/10 text-foreground border border-violet-500/20 shadow-sm"
                    }
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-violet-500">AI</span>
                      </div>
                    )}
                    {message.role === "assistant" ? (
                      <div className="leading-relaxed prose prose-sm dark:prose-invert max-w-none break-words [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath, remarkGfm]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-gradient-to-br from-card to-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-violet-500">AI</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[52px] max-h-32 resize-none bg-background/50 rounded-xl border-primary/20 focus:border-primary/50 focus:ring-primary/20"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-[52px] w-[52px] rounded-xl flex-shrink-0 press-effect bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 border-0 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyAssistantChat;
