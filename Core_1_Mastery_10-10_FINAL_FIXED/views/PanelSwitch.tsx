import type { PanelId } from "@/lib/nav";
import { ExamView } from "@/views/ExamView";
import { FlashView } from "@/views/FlashView";
import { GlossaryView } from "@/views/GlossaryView";
import { HomeView } from "@/views/HomeView";
import { IdentifyView } from "@/views/IdentifyView";
import { MasteryView } from "@/views/MasteryView";
import { MatchView } from "@/views/MatchView";
import { MesserCourseView } from "@/views/MesserCourseView";
import { PbqView } from "@/views/PbqView";
import { QuizPanel } from "@/views/QuizPanel";
import { ReviewView } from "@/views/ReviewView";
import { StrategyView } from "@/views/StrategyView";
import { StudyView } from "@/views/StudyView";
import { TopicsView } from "@/views/TopicsView";
import { TeachMeView } from "@/views/TeachMeView";
import { ToolsLabView } from "@/views/ToolsLabView";

export function PanelSwitch({ panel }: { panel: PanelId }) {
  switch (panel) {
    case "home": return <HomeView />;
    case "quiz": return <QuizPanel />;
    case "teach": return <TeachMeView />;
    case "exam": return <ExamView />;
    case "flash": return <FlashView />;
    case "glossary": return <GlossaryView />;
    case "identify": return <IdentifyView />;
    case "match": return <MatchView />;
    case "pbq": return <PbqView />;
    case "mastery": return <MasteryView />;
    case "review": return <ReviewView />;
    case "strategy": return <StrategyView />;
    case "topics": return <TopicsView />;
    case "tools": return <ToolsLabView />;
    case "course": return <MesserCourseView />;
    default: return <StudyView panel={panel} />;
  }
}
