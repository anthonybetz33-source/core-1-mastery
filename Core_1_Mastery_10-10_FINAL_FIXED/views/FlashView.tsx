import { useState } from "react";
import { FlipCard } from "@/components/FlipCard";
import { Button } from "@/components/ui/button";
import { flashcards } from "@/data";

export function FlashView() {
  const [index, setIndex] = useState(0);
  const card = flashcards[index] ?? flashcards[0];
  if (!card) return null;

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Flashcards
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Short front, full explanation on the back. Run these until ports, RAID,
        and power facts are automatic.
      </p>
      <div className="mx-auto mt-8 max-w-md">
        <FlipCard
          key={index}
          className="h-[300px]"
          front={
            <>
              <span className="absolute top-4 left-4 text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
                Term
              </span>
              <strong className="px-4 text-center text-2xl font-medium text-accent">
                {card.front}
              </strong>
            </>
          }
          back={
            <>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
                Description
              </span>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed">
                {card.back}
              </p>
            </>
          }
        />
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              setIndex((i) => (i - 1 + flashcards.length) % flashcards.length)
            }
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIndex((i) => (i + 1) % flashcards.length)}
          >
            Next
          </Button>
        </div>
        <p className="mt-3 text-center text-xs tabular-nums text-muted">
          {index + 1} / {flashcards.length}
        </p>
      </div>
    </div>
  );
}
