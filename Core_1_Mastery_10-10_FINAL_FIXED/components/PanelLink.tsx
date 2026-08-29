import { Link } from "@tanstack/react-router";
import { forwardRef, type ReactNode } from "react";
import type { PanelId } from "@/lib/nav";

export const PanelLink = forwardRef<
  HTMLAnchorElement,
  {
    id: PanelId;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
  }
>(function PanelLink({ id, className, children, onClick }, ref) {
  if (id === "home") {
    return (
      <Link ref={ref} to="/" className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <Link
      ref={ref}
      to="/$panel"
      params={{ panel: id }}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
});
