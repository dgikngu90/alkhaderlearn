import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, MailOpen, Megaphone, User as UserIcon, Send, Inbox, Trash2, MessageCircle, Sparkles, Bell, BellOff, CheckCheck, PenSquare, Home, Video, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import StudentSendMessageDialog from "@/components/StudentSendMessageDialog";
import SendMessageDialog from "@/components/SendMessageDialog";
import logo from "@/assets/logo.png";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  title: string;
  content: string;
  is_broadcast: boolean;
  created_at: string;
  read_at: string | null;
  sender_name?: string;
  recipient_name?: string;
}

const Messages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      const roles = roleData?.map(r => r.role) || [];
      if (roles.includes("teacher")) {
        setUserRole("teacher");
      } else if (roles.includes("admin")) {
        setUserRole("admin");
      }
      
      fetchMessages(user.id);
    };
    getUser();
  }, [navigate]);

  const fetchMessages = async (userId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = new Set<string>();
      messagesData?.forEach(m => {
        userIds.add(m.sender_id);
        if (m.recipient_id) userIds.add(m.recipient_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      
      const messagesWithNames = messagesData?.map(m => ({
        ...m,
        sender_name: profileMap.get(m.sender_id) || t("unknown"),
        recipient_name: m.recipient_id ? profileMap.get(m.recipient_id) || t("unknown") : null
      })) || [];

      const received = messagesWithNames.filter(m => 
        m.recipient_id === userId || m.is_broadcast
      );
      const sent = messagesWithNames.filter(m => m.sender_id === userId);

      setReceivedMessages(received);
      setSentMessages(sent);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("failedToLoadMessages")
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (message: Message) => {
    if (message.read_at || message.sender_id === user?.id) return;
    
    try {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", message.id);

      setReceivedMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, read_at: new Date().toISOString() } : m
      ));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadMessages = receivedMessages.filter(m => !m.read_at && m.sender_id !== user?.id);
      for (const msg of unreadMessages) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("id", msg.id);
      }
      setReceivedMessages(prev => prev.map(m => ({ ...m, read_at: m.read_at || new Date().toISOString() })));
      toast({ title: t("success"), description: "All messages marked as read" });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const { error } = await supabase.from("messages").delete().eq("id", messageId);
      if (error) throw error;
      setReceivedMessages(prev => prev.filter(m => m.id !== messageId));
      setSentMessages(prev => prev.filter(m => m.id !== messageId));
      setSelectedMessage(null);
      toast({ title: t("success"), description: "Message deleted" });
    } catch (error: any) {
      toast({ variant: "destructive", title: t("error"), description: error.message });
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (message.recipient_id === user?.id || message.is_broadcast) {
      markAsRead(message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = receivedMessages.filter(m => !m.read_at && m.sender_id !== user?.id).length;
  const totalMessages = receivedMessages.length + sentMessages.length;

  const renderMessageList = (messages: Message[], isSent: boolean) => {
    if (messages.length === 0) {
      return (
        <Card className="max-w-md mx-auto text-center py-12 glass-vibrant">
          <CardContent>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-4">{t("noMessages")}</p>
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                className="rounded-xl border-primary/30 hover:bg-primary/10"
                onClick={() => navigate("/dashboard")}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {messages.map((message) => (
          <Card 
            key={message.id} 
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] card-hover group ${
              !isSent && !message.read_at 
                ? 'border-primary/50 bg-gradient-to-r from-primary/5 to-violet-500/5' 
                : 'glass'
            }`}
            onClick={() => openMessage(message)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {isSent ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-md">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                  ) : message.read_at ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-secondary flex items-center justify-center shadow-sm">
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold truncate ${!isSent && !message.read_at ? 'gradient-text text-lg' : 'text-foreground'}`}>
                      {message.title}
                    </span>
                    {message.is_broadcast && (
                      <Badge variant="secondary" className="shrink-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-500/30">
                        <Megaphone className="h-3 w-3 mr-1" />
                        {t("broadcast")}
                      </Badge>
                    )}
                    {!isSent && !message.read_at && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-violet-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span className={!isSent && !message.read_at ? "text-primary font-medium" : ""}>
                      {isSent ? `${t("to")}: ${message.recipient_name || t("allStudents")}` : `${t("from")}: ${message.sender_name}`}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{formatDate(message.created_at)}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-orbs" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <header className="sticky top-0 z-50 glass border-b border-primary/20">
        <div className="container mx-auto px-4 py-3">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10 rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <img src={logo} alt="Alkhader Learn" className="h-8 w-8" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
              </div>
              <h1 className="text-lg font-bold gradient-text">{t("messages")}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-primary/30 hover:bg-primary/10"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              {user && (userRole === "teacher" || userRole === "admin"
                ? <SendMessageDialog user={user} />
                : <StudentSendMessageDialog user={user} />)}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/20">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{unreadCount} {t("unread")}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent/20 to-fuchsia-500/20 border border-accent/20">
              <Mail className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">{receivedMessages.length} Received</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20">
              <Send className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-medium">{sentMessages.length} Sent</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl hover:bg-primary/10"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl hover:bg-primary/10"
              onClick={() => navigate("/videos")}
            >
              <Video className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Videos</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl hover:bg-primary/10"
              onClick={() => navigate("/quizzes")}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Quizzes</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-violet-500 animate-spin flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white" />
            </div>
          </div>
        ) : selectedMessage ? (
          <Card className="glass-vibrant overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-accent" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)} className="hover:bg-primary/10 rounded-xl">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("back")}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                {selectedMessage.is_broadcast ? (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <CardTitle className="gradient-text">{selectedMessage.title}</CardTitle>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedMessage.sender_id === user?.id 
                  ? `${t("to")}: ${selectedMessage.recipient_name || t("allStudents")}`
                  : `${t("from")}: ${selectedMessage.sender_name}`
                } • {formatDate(selectedMessage.created_at)}
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="whitespace-pre-wrap text-lg leading-relaxed">{selectedMessage.content}</p>
              
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-primary/30 hover:bg-primary/10"
                  onClick={() => navigate("/dashboard")}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                {userRole === "admin" && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="received" 
                className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-violet-500 data-[state=active]:text-white"
              >
                <Inbox className="h-4 w-4" />
                {t("inbox")} {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger 
                value="sent" 
                className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-fuchsia-500 data-[state=active]:text-white"
              >
                <Send className="h-4 w-4" />
                {t("sent")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="received">
              {renderMessageList(receivedMessages, false)}
            </TabsContent>
            <TabsContent value="sent">
              {renderMessageList(sentMessages, true)}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Messages;
