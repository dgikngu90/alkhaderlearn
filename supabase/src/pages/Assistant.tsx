import StudyAssistantChat from "@/components/StudyAssistantChat";
import BottomNavigation from "@/components/BottomNavigation";
import DottedBackground from "@/components/DottedBackground";

const Assistant = () => {
  return (
    <DottedBackground className="min-h-screen bg-background pb-20">
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <StudyAssistantChat />
      </div>
      <BottomNavigation />
    </DottedBackground>
  );
};

export default Assistant;
