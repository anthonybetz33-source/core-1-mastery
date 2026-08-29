import { QuizView } from "@/components/QuizView";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function ReviewView() {
  const wrongBank = useAppStore((s) => s.wrongBank);
  const clearWrong = useAppStore((s) => s.clearWrong);
  const removeWrong = useAppStore((s) => s.removeWrong);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const addXP = useAppStore((s) => s.addXP);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Review misses
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Questions you missed are saved here. Drill them until they stick.
      </p>
      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span className="tabular-nums">Missed bank: {wrongBank.length}</span>
        {wrongBank.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clearWrong}>
            Clear bank
          </Button>
        ) : null}
      </div>
      <div className="mt-4">
        <QuizView
          key={wrongBank.length}
          items={wrongBank}
          onAnswer={(item, correct) => {
            recordAnswer(item.obj, correct);
            if (correct) {
              addXP(8);
              removeWrong(item.q);
            }
          }}
          empty="No misses yet — take the Quiz or Timed exam and wrong answers will show up here."
        />
      </div>
    </div>
  );
}
