import StudyAssistantChat from "@/components/StudyAssistantChat";
import BottomNavigation from "@/components/BottomNavigation";

const Assistant = () => {
  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-orbs" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-fuchsia-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float-reverse" />
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        <StudyAssistantChat />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Assistant;
