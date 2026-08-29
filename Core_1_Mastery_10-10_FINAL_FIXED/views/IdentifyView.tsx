import { QuizView } from "@/components/QuizView";
import { identifyQuestions } from "@/data";
import { useAppStore } from "@/lib/store";

export function IdentifyView() {
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const addXP = useAppStore((s) => s.addXP);
  const bumpQuizDone = useAppStore((s) => s.bumpQuizDone);

  const items = identifyQuestions.map((q) => ({
    q: "What is this connector / component?",
    options: q.options,
    a: q.options.indexOf(q.answer),
    e: `It is ${q.answer}.`,
    svg: q.svg,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Identify the connector
      </h1>
      <p className="mt-2 mb-6 max-w-2xl text-muted">
        Look at the drawing and choose the correct name. Built for PBQ
        recognition.
      </p>
      <QuizView
        items={items}
        onAnswer={(_item, correct) => {
          recordAnswer(undefined, correct);
          if (correct) addXP(12);
        }}
        onComplete={() => {
          bumpQuizDone();
          addXP(30);
        }}
      />
    </div>
  );
}
