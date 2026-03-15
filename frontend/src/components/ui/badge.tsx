import * as React from "react";
import { cn } from "../../lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-sage-200/70 dark:border-sage-700/70 bg-sage-50/70 dark:bg-slate-900/60 px-2.5 py-0.5 text-xs font-medium text-sage-700 dark:text-sage-200",
        className
      )}
      {...props}
    />
  );
}

