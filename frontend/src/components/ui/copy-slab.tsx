import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CopySlabProps = {
  as?: "p" | "span" | "div";
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "as" | "children" | "className">;

/** Opaque white pad for body copy sitting on `.halftone-bg`. */
export function CopySlab({ as = "p", children, className, ...rest }: CopySlabProps) {
  const Tag = as as ElementType;
  return (
    <Tag className={cn("copy-slab", className)} {...rest}>
      {children}
    </Tag>
  );
}
