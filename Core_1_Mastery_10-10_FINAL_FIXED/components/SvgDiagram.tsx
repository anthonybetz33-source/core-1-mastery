import { useMemo } from "react";
import { SVGs } from "@/data";
import { cn } from "@/lib/utils";

function uniquify(svg: string, prefix: string) {
  return svg
    .replace(/id="([^"]+)"/g, `id="${prefix}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
}

export function SvgDiagram({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const stableKey = id.replace(/[^a-zA-Z0-9_-]/g, "-");
  const html = useMemo(() => {
    const raw = SVGs[id] ?? "";
    const stripped = raw.replace(/<text[\s\S]*?<\/text>/gi, "");
    return uniquify(stripped, `svg-${stableKey}`);
  }, [id, stableKey]);

  return (
    <div
      className={cn(
        "flex items-center justify-center [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-full",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
