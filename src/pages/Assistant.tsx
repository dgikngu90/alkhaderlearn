import StudyAssistantChat from "@/components/StudyAssistantChat";
import BottomNavigation from "@/components/BottomNavigation";

const Assistant = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <StudyAssistantChat />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Assistant;
