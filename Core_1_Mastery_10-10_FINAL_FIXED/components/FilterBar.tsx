import { cn } from "@/lib/utils";

export function FilterBar({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "h-9 rounded-full px-3.5 text-xs font-medium transition-[background-color,color,box-shadow] duration-150",
              active
                ? "bg-accent text-accent-fg"
                : "bg-surface-2 text-muted shadow-[var(--shadow-border)] hover:text-fg",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
